// Release signing is opt-in: supply environment variables via CI secrets.
val nqReleaseKeystore = System.getenv("NQ_SIGNING_STORE_FILE")
val nqReleaseStorePassword = System.getenv("NQ_SIGNING_STORE_PASSWORD")
val nqReleaseKeyAlias = System.getenv("NQ_SIGNING_KEY_ALIAS")
val nqReleaseKeyPassword = System.getenv("NQ_SIGNING_KEY_PASSWORD")
val hasReleaseSigning = listOf(nqReleaseKeystore, nqReleaseStorePassword, nqReleaseKeyAlias, nqReleaseKeyPassword)
    .all { !it.isNullOrBlank() }

plugins {
    id("com.android.application")
}

android {
    namespace = "dev.nolqu.nqcode"
    compileSdk = 36

    defaultConfig {
        applicationId = "dev.nolqu.nqcode"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "1.0.0-alpha.1"
    }
    signingConfigs {
        if (hasReleaseSigning) {
            create("alphaRelease") {
                storeFile = file(nqReleaseKeystore!!)
                storePassword = nqReleaseStorePassword
                keyAlias = nqReleaseKeyAlias
                keyPassword = nqReleaseKeyPassword
            }
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            if (hasReleaseSigning) signingConfig = signingConfigs.getByName("alphaRelease")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
