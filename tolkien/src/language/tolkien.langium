grammar Tolkien

entry Model:
(
    module=Module |
    goVersion=GoVersion |
    dependencies+=Dependency |
    types+=Type |
    daos+=Dao |
    services+=Service |
    controllers+=Controller
)*;

Module:
    'module' name=ID;

GoVersion:
    'goVersion' name=STRING;

Dependency:
    'lib' name=STRING;

Type:
    'type' name=ID;

Method:
    'func' name=ID;

Dao:
    'dao' name=ID ('methods=['methods+=Method (',' methods+=Method)*']')?;

Service:
    'service' name=ID ('services=['services+=Service (',' services+=Service)*']')? ('daos=['daos+=Dao (',' daos+=Dao)*']')?;

Controller:
    'controller' name=ID ('services=['services+=Service (',' services+=Service)*']')?;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;



terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
