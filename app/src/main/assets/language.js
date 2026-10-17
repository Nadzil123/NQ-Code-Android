/* NQ Code 1.0.0-alpha.2 — dependency-free, offline lexical highlighting.
 * This is intentionally a lexer, not a parser or LSP; no network resources.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.NQLanguage = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const escape = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const languages = Object.freeze([
    'Plain Text','JavaScript','TypeScript','Python','Java','Kotlin','C','C++','Rust','Go',
    'HTML','XML','CSS','JSON','Markdown','Shell','YAML','SQL','TOML','Dart','PHP'
  ]);
  const names = Object.freeze({
    js:'JavaScript',mjs:'JavaScript',cjs:'JavaScript',jsx:'JavaScript',ts:'TypeScript',tsx:'TypeScript',
    py:'Python',pyw:'Python',java:'Java',kt:'Kotlin',kts:'Kotlin',c:'C',h:'C',cc:'C++',cpp:'C++',cxx:'C++',hpp:'C++',hxx:'C++',
    rs:'Rust',go:'Go',html:'HTML',htm:'HTML',xml:'XML',svg:'XML',css:'CSS',scss:'CSS',json:'JSON',jsonc:'JSON',
    md:'Markdown',markdown:'Markdown',sh:'Shell',bash:'Shell',zsh:'Shell',yml:'YAML',yaml:'YAML',sql:'SQL',toml:'TOML',dart:'Dart',php:'PHP'
  });
  const words = {
    JavaScript:'async await break case catch class const continue debugger default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while with yield',
    TypeScript:'abstract any as asserts bigint boolean constructor declare enum export extends false from get implements import infer interface is keyof module namespace never null number override private protected public readonly require satisfies set static string symbol type typeof unknown void',
    Python:'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield self',
    Java:'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long native new null package private protected public record return short static strictfp super switch synchronized this throw throws transient true false try var void volatile while',
    Kotlin:'abstract annotation as break by catch class companion const constructor continue crossinline data delegate do else enum expect external false final finally for fun if import in infix init inline inner interface internal is it lateinit noinline null object open operator out override package private protected public reified return sealed suspend super tailrec this throw true try typealias val var when where while',
    C:'auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while _Bool _Complex _Atomic',
    'C++':'alignas alignof asm auto bool break case catch char class const constexpr consteval constinit continue decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept nullptr operator override private protected public register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typename union unsigned using virtual void volatile wchar_t while',
    Rust:'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while',
    Go:'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var true false nil',
    Dart:'abstract as assert async await break case catch class const continue covariant default deferred do dynamic else enum export extends extension external factory false final finally for Function get hide if implements import in interface is late library mixin new null on operator part required rethrow return set show static super switch sync this throw true try typedef var void while with yield',
    PHP:'abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile enum eval exit extends final finally fn for foreach function global goto if implements include instanceof insteadof interface isset list match namespace new null or print private protected public readonly require return static switch throw trait true try unset use var while xor yield',
    Shell:'case do done elif else esac export fi for function if in local readonly return select set shift source then trap until while',
    CSS:'important inherit initial unset revert auto none solid block flex grid inline relative absolute fixed sticky !important',
    SQL:'add all alter and as asc between by case cast check column constraint create cross database default delete desc distinct drop else end exists false foreign from full group having in index inner insert into is join key left like limit not null offset on or order outer primary references right select set table then true union unique update values view when where with',
    YAML:'true false null yes no on off', TOML:'true false'
  };
  const keywords = Object.create(null);
  for (const [name, group] of Object.entries(words)) keywords[name] = new Set(group.split(/\s+/));
  const detect = filename => {
    const base = String(filename || '').split(/[\\/]/).pop().toLowerCase();
    if (['dockerfile','makefile','readme'].includes(base)) return base === 'readme' ? 'Markdown' : 'Plain Text';
    if (base === '.bashrc' || base === '.zshrc') return 'Shell';
    return names[base.split('.').pop()] || 'Plain Text';
  };
  const isAlpha = ch => !!ch && /[A-Za-z_$]/.test(ch);
  const isWord = ch => !!ch && /[\w$]/.test(ch);
  const isDigit = ch => !!ch && /\d/.test(ch);
  const simple = language => ['Plain Text','Markdown','HTML','XML','JSON','CSS','SQL','TOML','YAML'].includes(language);
  const hashComment = language => ['Python','Shell','YAML','TOML'].includes(language);
  const slashComment = language => !['Python','Shell','YAML','TOML','SQL','HTML','XML','JSON','Markdown'].includes(language);
  function highlight(source, language='Plain Text', maxTokens=20000) {
    const text=String(source);
    if (!languages.includes(language) || language==='Plain Text') return escape(text);
    let out='', start=0, i=0, n=0, fenced=false;
    const emit=(end,kind)=>{
      out += escape(text.slice(start,i));
      const token=escape(text.slice(i,end));
      out += kind ? `<span class="code-${kind}">${token}</span>` : token;
      i=end;start=i;n++;
    };
    while(i<text.length && n<maxTokens) {
      const ch=text[i], next=text[i+1], atLine=i===0 || text[i-1]==='\n';
      if(language==='Markdown'){
        if(atLine && (text.startsWith('```',i)||text.startsWith('~~~',i))){const end=text.indexOf('\n',i);fenced=!fenced;emit(end<0?text.length:end,'keyword');continue;}
        if(fenced){const end=text.indexOf('\n',i);emit(end<0?text.length:end+1,'string');continue;}
        if(atLine && /^#{1,6}\s/.test(text.slice(i,i+8))){const end=text.indexOf('\n',i);emit(end<0?text.length:end,'heading');continue;}
        if(ch==='`'){let end=text.indexOf('`',i+1);emit(end<0?text.length:end+1,'string');continue;}
        if(ch==='['){const m=/^\[[^\]\n]+\]\([^\)\n]+\)/.exec(text.slice(i,i+200));if(m){emit(i+m[0].length,'tag');continue;}}
      }
      if((language==='HTML'||language==='XML') && text.startsWith('<!--',i)){
        const e=text.indexOf('-->',i+4);emit(e<0?text.length:e+3,'comment');continue;
      }
      if((language==='HTML'||language==='XML') && ch==='<' && (isAlpha(next)||next==='/'||next==='!')){
        const m=/^<\/?[A-Za-z][^<>]*?>/.exec(text.slice(i,i+4096));if(m){emit(i+m[0].length,'tag');continue;}
      }
      if((language==='CSS') && ch==='/'&&next==='*'){
        const e=text.indexOf('*/',i+2);emit(e<0?text.length:e+2,'comment');continue;
      }
      if(language==='SQL' && ch==='-'&&next==='-'){
        const e=text.indexOf('\n',i);emit(e<0?text.length:e,'comment');continue;
      }
      if(hashComment(language) && ch==='#'){
        const e=text.indexOf('\n',i);emit(e<0?text.length:e,'comment');continue;
      }
      if(slashComment(language) && ch==='/' && next==='/'){
        const e=text.indexOf('\n',i);emit(e<0?text.length:e,'comment');continue;
      }
      if((slashComment(language)||language==='SQL')&& ch==='/'&&next==='*'){
        const e=text.indexOf('*/',i+2);emit(e<0?text.length:e+2,'comment');continue;
      }
      if(language==='Python' && (text.startsWith('"""',i) || text.startsWith("'''",i))){
        const quote=text.slice(i,i+3);const e=text.indexOf(quote,i+3);emit(e<0?text.length:e+3,'string');continue;
      }
      if(ch==='"'||ch==="'"||(ch==='`' && ['JavaScript','TypeScript'].includes(language))){
        if(language==='Rust'&&ch==="'"&&isAlpha(next)&&text[i+2]!=="'"){i++;continue;}
        let j=i+1;
        while(j<text.length){
          if(text[j]==='\\'){j+=2;continue;}
          if(text[j]===ch){j++;break;}
          if(text[j]==='\n' && ch!=='`'){break;}
          j++;
        }
        let kind='string';
        if(language==='JSON' && ch==='"' && /^\s*:/.test(text.slice(j,j+24))) kind='property';
        emit(Math.min(j,text.length),kind);continue;
      }
      if(language==='Python' && ch==='@' && isAlpha(next)){
        let j=i+1;while(isWord(text[j])||text[j]==='.')j++;emit(j,'decorator');continue;
      }
      if(isDigit(ch) && (i===0 || !isWord(text[i-1]))){
        const m=/^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)/.exec(text.slice(i,i+100));
        if(m){emit(i+m[0].length,'number');continue;}
      }
      if(isAlpha(ch)){
        let j=i+1;while(isWord(text[j]))j++;
        const word=text.slice(i,j), kw=keywords[language];
        let kind=kw?.has(language==='SQL'?word.toLowerCase():word)?'keyword':null;
        if(!kind && language==='JSON' && (word==='true'||word==='false'||word==='null'))kind='keyword';
        if(!kind && ['HTML','XML','Markdown'].includes(language)){i=j;continue;}
        if(!kind && /^\s*\(/.test(text.slice(j,j+20)) && !simple(language))kind='function';
        if(kind){emit(j,kind);continue;}
        i=j;continue;
      }
      i++;
    }
    out += escape(text.slice(start));
    return out || ' ';
  }
  return Object.freeze({languages, detect, highlight});
});
