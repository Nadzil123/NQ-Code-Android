package dev.nolqu.nqcode;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Small native Android shell. All files are accessed through user-granted SAF URIs.
 * The bundled HTML is the only page allowed to run the Android JavaScript bridge.
 */
public class MainActivity extends Activity {
    private static final int OPEN_DOCUMENT = 11;
    private static final int OPEN_TREE = 12;
    private static final int CREATE_DOCUMENT = 13;
    private static final int MAX_FILE_BYTES = 2 * 1024 * 1024;

    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private WebView web;
    private SharedPreferences prefs;
    private Uri workspaceTree;
    private String pendingSaveData = "";

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(0xff101319);
        getWindow().setNavigationBarColor(0xff101319);
        prefs = getSharedPreferences("nqcode", MODE_PRIVATE);
        String saved = prefs.getString("workspace", "");
        if (!saved.isEmpty()) workspaceTree = Uri.parse(saved);
        web = new WebView(this);
        web.setBackgroundColor(0xff101319);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDefaultTextEncodingName("UTF-8");
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        web.addJavascriptInterface(new AndroidBridge(), "NQAndroid");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                return !url.startsWith("file:///android_asset/");
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (!url.startsWith("file:///android_asset/")) return;
                String root = "";
                String displayName = "";
                if (workspaceTree != null) {
                    try {
                        root = rootDocumentUri().toString();
                        displayName = DocumentsContract.getTreeDocumentId(workspaceTree);
                    } catch (Exception ignored) { }
                }
                emit("NativeEvents.ready(" + JSONObject.quote(root) + "," + JSONObject.quote(displayName) + ")");
            }
        });
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }

    private void emit(String js) {
        runOnUiThread(() -> {
            if (web != null) web.evaluateJavascript("if(window.NativeEvents){" + js + ";}", null);
        });
    }

    private Uri rootDocumentUri() {
        return DocumentsContract.buildDocumentUriUsingTree(
                workspaceTree, DocumentsContract.getTreeDocumentId(workspaceTree));
    }

    private void readFile(Uri uri) {
        io.execute(() -> {
            try (InputStream input = getContentResolver().openInputStream(uri)) {
                if (input == null) throw new Exception("Tidak dapat membaca file.");
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                byte[] buf = new byte[16384];
                int count;
                while ((count = input.read(buf)) != -1) {
                    if (out.size() + count > MAX_FILE_BYTES)
                        throw new Exception("Batas editor 2 MB per file.");
                    out.write(buf, 0, count);
                }
                byte[] bytes = out.toByteArray();
                for (byte b : bytes) if (b == 0) throw new Exception("File biner tidak didukung.");
                String encoded = Base64.encodeToString(bytes, Base64.NO_WRAP);
                emit("NativeEvents.fileOpened(" + JSONObject.quote(uri.toString()) + "," +
                        JSONObject.quote(displayName(uri)) + "," + JSONObject.quote(encoded) + ")");
            } catch (Exception e) {
                failure(e.getMessage());
            }
        });
    }

    private String displayName(Uri uri) {
        try (Cursor c = getContentResolver().query(uri,
                new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst()) return c.getString(0);
        } catch (Exception ignored) { }
        return uri.getLastPathSegment() == null ? "Untitled" : uri.getLastPathSegment();
    }

    private void writeFile(Uri uri, String encoded, boolean newlyCreated) {
        io.execute(() -> {
            try {
                byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
                if (bytes.length > MAX_FILE_BYTES) throw new Exception("Batas editor 2 MB per file.");
                try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
                    if (output == null) throw new Exception("Lokasi file hanya-baca.");
                    output.write(bytes);
                    output.flush();
                }
                emit("NativeEvents.saved(" + JSONObject.quote(uri.toString()) + "," +
                        JSONObject.quote(displayName(uri)) + "," + newlyCreated + ")");
            } catch (Exception e) {
                failure(e.getMessage());
            }
        });
    }

    private void failure(String message) {
        emit("NativeEvents.error(" + JSONObject.quote(message == null ? "Operasi gagal." : message) + ")");
    }

    private final class AndroidBridge {
        @JavascriptInterface public void openDocument() {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
                        Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
                startActivityForResult(i, OPEN_DOCUMENT);
            });
        }
        @JavascriptInterface public void openFolder() {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
                        Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
                startActivityForResult(i, OPEN_TREE);
            });
        }
        @JavascriptInterface public void openUri(String uri) {
            readFile(Uri.parse(uri));
        }
        @JavascriptInterface public void listFolder(String parent) {
            io.execute(() -> {
                if (workspaceTree == null) { failure("Pilih folder terlebih dahulu."); return; }
                JSONArray entries = new JSONArray();
                try {
                    Uri parentUri = Uri.parse(parent);
                    String parentId = DocumentsContract.getDocumentId(parentUri);
                    Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(workspaceTree, parentId);
                    String[] projection = {
                            DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                            DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                            DocumentsContract.Document.COLUMN_MIME_TYPE
                    };
                    try (Cursor c = getContentResolver().query(children, projection, null, null, null)) {
                        if (c != null) while (c.moveToNext()) {
                            String id = c.getString(0);
                            String name = c.getString(1);
                            String mime = c.getString(2);
                            Uri childUri = DocumentsContract.buildDocumentUriUsingTree(workspaceTree, id);
                            JSONObject item = new JSONObject();
                            item.put("name", name);
                            item.put("uri", childUri.toString());
                            item.put("folder", DocumentsContract.Document.MIME_TYPE_DIR.equals(mime));
                            entries.put(item);
                        }
                    }
                    emit("NativeEvents.directory(" + JSONObject.quote(parent) + "," + entries + ")");
                } catch (Exception e) { failure(e.getMessage()); }
            });
        }
        @JavascriptInterface public void save(String uri, String encoded) {
            writeFile(Uri.parse(uri), encoded, false);
        }
        @JavascriptInterface public void saveAs(String suggestedName, String encoded) {
            runOnUiThread(() -> {
                pendingSaveData = encoded;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("application/octet-stream");
                i.putExtra(Intent.EXTRA_TITLE, suggestedName);
                startActivityForResult(i, CREATE_DOCUMENT);
            });
        }
        @JavascriptInterface public void create(String parent, String name, boolean folder) {
            io.execute(() -> {
                try {
                    if (workspaceTree == null) throw new Exception("Buka folder proyek terlebih dahulu.");
                    if (name.trim().isEmpty() || name.contains("/") || name.contains("\\"))
                        throw new Exception("Nama file/folder tidak valid.");
                    Uri made = DocumentsContract.createDocument(getContentResolver(), Uri.parse(parent),
                            folder ? DocumentsContract.Document.MIME_TYPE_DIR : "application/octet-stream", name);
                    if (made == null) throw new Exception("Gagal membuat item.");
                    emit("NativeEvents.created(" + JSONObject.quote(parent) + "," +
                            JSONObject.quote(made.toString()) + "," + JSONObject.quote(name) + "," + folder + ")");
                } catch (Exception e) { failure(e.getMessage()); }
            });
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null || data.getData() == null) {
            if (requestCode == CREATE_DOCUMENT) { pendingSaveData = ""; emit("NativeEvents.saveCancelled()"); }
            return;
        }
        Uri uri = data.getData();
        if (requestCode == OPEN_DOCUMENT) {
            try {
                int flags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                getContentResolver().takePersistableUriPermission(uri, flags);
            } catch (Exception ignored) { }
            readFile(uri);
        } else if (requestCode == OPEN_TREE) {
            try {
                int flags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                getContentResolver().takePersistableUriPermission(uri, flags);
                workspaceTree = uri;
                prefs.edit().putString("workspace", uri.toString()).apply();
                emit("NativeEvents.folderSelected(" + JSONObject.quote(rootDocumentUri().toString()) + "," +
                        JSONObject.quote(DocumentsContract.getTreeDocumentId(uri)) + ")");
            } catch (Exception e) { failure(e.getMessage()); }
        } else if (requestCode == CREATE_DOCUMENT) {
            String encoded = pendingSaveData;
            pendingSaveData = "";
            writeFile(uri, encoded, true);
        }
    }

    @Override public void onBackPressed() {
        emit("App.back()");
    }

    @Override protected void onDestroy() {
        io.shutdown();
        if (web != null) {
            web.removeJavascriptInterface("NQAndroid");
            web.destroy();
        }
        super.onDestroy();
    }
}
