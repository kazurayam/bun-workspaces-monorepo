# bun-workspaces-monorepo

このGitレポジトリでわたしは次のようなことをした。

1. TypeScript言語でアプリを作ります。JavaScriptではなくて。
2. JavaScriptランタイムとして[bun](https://bun.com/)を使います。[Node.js](https://nodejs.org/ja)でも[Deno](https://deno.com/)でもなくて。
3. パッケージ管理システムとしてbunを使う。[npm](https://www.npmjs.com/)でも[yarn](https://yarnpkg.com/)でも[pnpm](https://pnpm.io/)でもなく。
4. いわゆる「モノレポ」にする。すなわちひとつのGitレポジトリの中に二つ以上のパッケージを収納して開発する。libとappと名付けようか。appのTypeScriptコードがlibの成果物をimportして使う、という依存関係を持たせる。

## 説明

## プロジェクト構造の作成

### ルートディレクトリを作る

```
$ cd ~/github
$ mkdir bun-workspaces-monorepo
$ cd  bun-workspaces-monorepo
$ ROOT=`pwd`
$ bun init -y
```

>ここで `ROOT` というシェル変数を宣言しレポジトリの最上位のディレクトリのパスを設定した。以下の説明の中で最上位ディレクトリを表現するのに `${ROOT}` という記号で表すことにする。

"bun init"コマンドはBunプロジェクトの雛形を作成するコマンド。

>`-y`オプションは「すべての質問にyesと答える」という意味。"-y"を指定しないと"bun init"コマンドがいろいろ質問してくるが、全部デフォルトで構わないなら"-y"と答えるのが手間要らずだ。

こんなファイル群が作られる。

```
$ cd ${ROOT}
$ tree -L 2 .
.
├── bun.lock
├── CLAUDE.md
├── index.ts
├── node_modules
│   ├── @types
│   ├── bun-types
│   ├── typescript
│   └── undici-types
├── package.json
├── README.md
└── tsconfig.json
```

### ルート直下の package.json を作る

モノレポを作るにはテキストエディタで `${ROOT}/package.json` に `workspaces` キーを宣言する。

```
{
  "name": "@kazurayam/bun-workspaces-monorepo-example",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

`workspaces`キーの値として名前を列挙されたサブディレクトリがこのモノレポを構成する。サブディレクトリの中身のことを package と呼んだり workspace と呼ぶこともある。

>"workspace"という用語は[yarn workspace](https://zenn.dev/uttk/scraps/b4d795387e8368)コマンドから来ているらしい。npmもv7でworkspace機能を追加した。bunはyarnよりも後発だから、yarnの用語をそのまま継承している。

ROOTの直下に `packages` ディレクトリを作り、その下にworkspaceのディレクトリを作るのが標準的なディレクトリ構成だ。従うべし。

```
  "workspaces": [
    "packages/*"
  ]
```

こんなふうに[Glob](https://bun.com/docs/runtime/glob)記法を使えば packages ディレクトリの下にあるぜんぶのサブディレクトリを workspace とみなすことになる。あえて[Glob](https://bun.com/docs/runtime/glob)記法を使わすに具体的なディレクトリを列挙するのでも良い。こんなふうに。

```
  ...
  "workspaces": [
    "packages/app",
    "packages/lib"
  ]
  ...
```

### CLAUDE.mdって何?

"bun init"コマンドがルート直下に [CLAUDE.md](https://github.com/kazurayam/bun-workspaces-monorepo/blob/master/CLAUDE.md) ファイルを作った。これはnpmユーザがbunを使うのに役立つチートシートだ。npmの代わりにどういうbunコマンドをタイプすべきかを教えてくれる。とてもありがたい。

### workspaceを作る

ルート直下に `packages` ディレクトリを作る。その下に `app` と `lib` ディレクトリを作る。さらにそれぞれの下に `package.json` と `index.ts` を作る。

```
$ cd ${ROOT}
$ tree -L 3 .
.
├── bun.lock
├── CLAUDE.md
├── index.ts
├── package.json
├── packages
│   ├── app
│   │   ├── index.ts
│   │   └── package.json
│   └── lib
│       ├── index.ts
│       └── package.json
├── README.md
└── tsconfig.json
```

### libパッケージを作る

各workspaceはそれぞれに `package.json` を持つ。

[packages/lib/package.json](https://github.com/kazurayam/bun-workspaces-monorepo/blob/master/packages/lib/package.json) にはこう書いた。特にかわったところは無い。

```
{
    "name": "@kazurayam/bun-workspaces-monorepo-lib",
    "version": "1.0.0",
    "main": "index.ts",
    "type": "module",
    "dependencies": {
        "@types/bun": "latest",
        "es-toolkit": "^1.26.1"
    },
    "peerDependencies": {
        "typescript": "^5"
    }
}
```

libパッケージがes-toolkitに依存することを宣言するにはbun addコマンドを使った。

```
$ cd ${ROOT}/packages/lib
$ bun add es-toolkit
bun add v1.3.4 (5eb2145b)

installed es-toolkit@1.43.0

[226.00ms] done
```

libパッケージの `index.ts` には `myShuffle` 関数を定義してexportした。

```
// packages/lib/index.ts
import { shuffle } from "es-toolkit";

export const myShuffle = <T>(arr: T[]): T[] => shuffle(arr);
```

### appパッケージを作る

appパッケージの `index.ts` が `myShuffle` 関数をimportする。

```
// packages/app/index.ts
import { myShuffle } from "@kazurayam/bun-workspaces-monorepo-lib";

const data = [1, 2, 3, 4, 5];

console.log(myShuffle(data));
```

[packages/app/package.json](https://github.com/kazurayam/bun-workspaces-monorepo/blob/master/packages/app/package.json) にはこう書いた。

```
{
    "name": "@kazurayam/bun-workspaces-monorepo-app",
    "version": "1.0.0",
    "main": "index.ts",
    "type": "module",
    "dependencies": {
        "@kazurayam/bun-workspaces-monorepo-lib": "workspace:*"
    }
}
```

おっと、`dependencies` の記述の中に妙なものがある。`@kazurayam/bun-workspaces-monorep-app`パッケージが `@kazurayam/bun-workspaces-monorepo-lib` パッケージにdependしますよと宣言している。これがあるからこそ `packages/app/index.ts` が次のような import 文を書くことができる。

```
import { myShuffle } from "@kazurayam/bun-workspaces-monorepo-lib";
```

では、`@kazurayam/bun-workpaces-monorepo-lib`パッケージの実体がどこにあるのかを `app/package.json` がどう表現しているのだろうか？

`"workspace:*"` と書いてあった。これはURLの形式に準じた記法だ。URLのスキーマが "workspace" なのだ。Bun公式ドキュメント[Workspaces](https://bun.com/docs/pm/workspaces)に次のように説明されている。

>The `workspace:*` and `workspace:^` notations are used in package management to reference internal packages within a monorepo. `workspace:*` refers to the latest version of a package, while `workspace:^` allows for version compatibility, meaning it can reference any compatible version according to semantic versioning rules.

>When publishing, workspace: versions are replaced by the package’s package.json version,

```
"workspace:*" -> "1.0.1"
"workspace:^" -> "^1.0.1"
"workspace:~" -> "~1.0.1"
```

>この説明の中で `1.0.1` というバージョン番号らしき記号が書かれているが、この値がどこから引用されてくるのか、いまいちわからない。多分 `@kazurayam/bun-workspaces-monorepo-lib` パッケージの `package.json` ファイルの中に書かれた `version` キーの値なんだろうなと思う。しかし `^` とか `~` とかいう記号がいったいどのような働きを持つのか、説明がないし、想像できない。あやしい。将来、仕様が変更されるんじゃないかと推測する。


## すべての依存関係をインストールする

rootディレクトリに戻れ。そしてbun installを実行せよ。

```
$ cd ${ROOT}
$ bun install
```

すると `packages/app` の下に `node_modules` ディレクトリができる。`packages/lib` の下にも `node_modules` ディレクトリができる。

`${ROOT}/node_modules/app`ディレクトリの中を眺めてみよう。

```
$ cd $ROOT
$ tree -L 2 packages/app/node_modules
packages/app/node_modules
├── @kazurayam
│   └── bun-workspaces-monorepo-lib -> ../../../lib
└── es-toolkit -> ../../../node_modules/.bun/es-toolkit@1.43.0/node_modules/es-toolkit
```

なるほど。`packages/app` ディレクトリの中にあるこのパッケージは `@kazurayam/bun-workspaces-monorepo-lib` パッケージに依存していると宣言されている。そして `packages/app/node_modules/@kazurayam/bun-workspaces-monorepo-lib`ディレクトリは実はシンボリックリンクである。このシンボリックリンクは `packages/lib` ディレクトリを指している。こうなっているから `packages/app/index.ts` のなかのコード

```
import { myShuffle } from "@kazurayam/bun/workspaces-monorepo-lib";
```

これが正しくコンパイルできる。こういう仕組みによってモノレポのなかの２つのパッケージの間にあるべき参照関係が実現されている。

### bun installコマンドの --linker オプション

余談を一つ。

```
$ bun install
```

これは `--linker isolated` を指定したのと同じだ。

```
$ bun install --linker isolated
```

もう一つのやり方がある。

```
$ bun install --linker hoisted
```

これを実行すると`node_modules` ディレクトリが作られる場所が変わる。`--linker isolated`ならば個別パッケージのディレクトリの下に作られる。`--linker hoisted`ならばレポジトリのルートの下に作られる。その中を見ると...

```
$ cd ${ROOT}
$ tree -L 1 node_modules
node_modules
├── @kazurayam
├── @types
├── bun-types
├── es-toolkit
├── typescript
└── undici-types

$ tree -L 1 ./node_modules/@kazurayam
node_modules/@kazurayam
├── bun-workspaces-monorepo-app -> ../../packages/app
└── bun-workspaces-monorepo-lib -> ../../packages/lib
```

ルート直下のnode_modulesの中に `@kazurayam` ディレクトリができていて、その下に `bun-workspaces-monorepo-app` ができていた。このディレクトリ名は `packages/app/package.json` ファイルの中で `name` キーとして指定した値に基づいて決定されたに違いない。そして `bun-workspaces-monorepo-app` ディレクトリは実はシンボリックリンクであり、実体は `${ROOT}/packages/app` ディレクトリを指している。

TypeScriptコンパイラはdependenciesの参照関係を解決するのに、workspaceが個別に持っているnode_modulesディレクトリがあればその中を最初に検索するが、見つからなければルート直下にnode_modulesディレクトリがあればその中を検索する、という「巻き上げ」のような動作をする。このような動きをJavaScript用語で「ホイスティング」という。`--linker hoisted` というオプションによって選択することができる。yarnやpnpmはホイスティングをデフォルトの動作とするが、bunは意図的に `--linker isolated` をデフォルトとして選択している。Bun公式ドキュメント[Isolated install](https://bun.com/docs/pm/isolated-installs) の "Using isolated installs / Command line" の説明をみよ。


### VSCodeの画面をリフレッシュすべきこと

VSCodeを使っているときに一つ注意すべきことがある。bun installコマンドによってディレクトリやファイルを作った時、VSCodeの画面表示にすぐ反映しないかもしれない。「あれ？node_modulesが作られないな？」と迷うかもしれない。これはVSCodeが直接関知しないやり方で生じたファイルシステムの変化をVSCodeがすぐに感知してくれない場合があるからだ。その場合はVSCodeのリフレッシュボタンを明示的に押せばいい。VSCodeを設定して自動的に反映するようにすることもできるから検討してもいい。


## アプリが動作することを確認する

packages/app/index.tsを実行してみよう

```
$ cd ${ROOT}
$ bun run packages/app/index.ts
[ 5, 3, 1, 2, 4 ]
```

はい、アプリが動きました。モノレポ、一丁あがり。

## 参考情報

1. Bun公式ドキュメント [Workspaces](https://bun.com/docs/pm/workspaces)
2. d2m記事 [Bunでモノレポ環境を構築してみた](https://daichi2mori.com/blog/20241106-bun-workspace)
