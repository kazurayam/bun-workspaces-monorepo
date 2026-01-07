# bun-workspaces-monorepo

このGitレポジトリは次のようなことをします。

1. TypeScript言語でアプリを作ります。JavaScriptではなくて。
2. JavaScriptランタイムとして[bun](https://bun.com/)を使います。[Node.js](https://nodejs.org/ja)でも[Deno](https://deno.com/)でもなくて。
3. パッケージ管理システム[npm](https://www.npmjs.com/)を使わず、bunを使う。
4. いわゆる「モノレポ」にする。すなわちひとつのGitレポジトリの中に二つ以上のパッケージを格納する。libパッケージとappパッケージと名付けよう。appパッケージのTypeScriptコードがlibパッケージの成果物をimportして使う、という依存関係を持たせる。

## 説明

## プロジェクト構造の作成

### ルートディレクトリを作る

```
$ mkdir bun-workspaces-monorepo
$ cd  bun-workspaces-monorepo
$ bun init -y
```

"bun init"コマンドはBunプロジェクトを作成するコマンド。`-y`オプションは「すべての質問にyesと答える」という意味。"-y"を指定しないと"bun init"コマンドがいろいろ質問してくるが、全部デフォルトで構わないなら"-y"と答えるのが良い。

こんなファイル群が作られる。

```
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

テキストエディタで `<root>/package.json` をこう書く。

```
{
  "name": "bun-workspaces-monorepo-example",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

`workspaces`キーが重要。`workspaces`キーの値として名前を列挙されたサブディレクトリがこのモノレポを構成する。サブディレクトリの中身のことを package と呼んだり workspace と呼ぶこともある。

>"workspace"という用語は[yarn workspace](https://zenn.dev/uttk/scraps/b4d795387e8368)コマンドから来ているらしい。npmもv7でworkspace機能を追加した。bunはyarnよりも後発だから、yarnの用語をそのまま継承している。

rootの直下に `packages` ディレクトリを作り、その下にworkspaceのディレクトリを作るのが標準的なディレクトリ構成だ。従うべし。

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

"bun init"はルート直下に [CLAUDE.md](https://github.com/kazurayam/bun-workspaces-monorepo/blob/master/CLAUDE.md) ファイルを作った。これはnpmユーザがbunを使うのに役立つチートシート。npmの代わりにどういうbunコマンドをタイプすべきかを教えてくれる。とてもありがたい。

### workspaceを作る

ルート直下に `packages` ディレクトリを作る。その下に `app` と `lib` ディレクトリを作る。さらにそれぞれの下に `package.json` と `index.ts` を作る。

```
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
    "name": "lib",
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

appパッケージがes-toolkitに依存することを宣言するにはbun addコマンドを使った。

```
$ cd packages/app
$ bun add es-toolkit
bun add v1.3.4 (5eb2145b)

installed es-toolkit@1.43.0

[226.00ms] done
```

libパッケージの `index.ts` には `myShuffle` 関数を定義してexportした。

packages/lib/index.ts
```
import { shuffle } from "es-toolkit";

export const myShuffle = <T>(arr: T[]): T[] => shuffle(arr);
```

### appパッケージを作る

appパッケージの `index.ts` が `myShuffle` 関数をimportする。

packages/app/index.ts
```
import { myShuffle } from "lib";

const data = [1, 2, 3, 4, 5];

console.log(myShuffle(data));
```

[packages/app/package.json](https://github.com/kazurayam/bun-workspaces-monorepo/blob/master/packages/app/package.json) にはこう書いた。

```
{
    "name": "app",
    "version": "1.0.0",
    "main": "index.ts",
    "type": "module",
    "dependencies": {
        "lib": "workspace:*"
    }
}
```

おっと、ここに注目しよう。

```
    "dependencies": {
        "lib": "workspace:*"
    }
```

`lib`というパッケージ名が宣言されている。これがあることによって `packages/app/index.ts` が次のような import 文を書くことができる。

```
import { myShuffle } from "lib";
```

さて、`lib`パッケージがどこにあると宣言しているかというと `"workspace:*"` だ。これはURLの形式に準じた記法だ。URLのスキーマが "workspace" なのだ。

>:の右隣の * は何を表しているのだろうか？ まだ私は勉強不足だ、答えを知らない。

## すべての依存関係をインストールする

rootディレクトリに戻れ。そしてbun installを実行せよ。

```
$ cd bun-workspaces-monorep
$ bun install
```

するとルート直下に `node_modules` ディレクトリができる。

```
$ tree -L 2 node_modules
node_modules
├── @types
│   └── bun -> ../.bun/@types+bun@1.3.5/node_modules/@types/bun
├── app -> ../packages/app
├── lib -> ../packages/lib
└── typescript -> .bun/typescript@5.9.3/node_modules/typescript
```

ルート直下のnode_modulesの中にディレクトリはシンボリックリンクです。たとえば
`<root>/node_modules/lib`はシンボリックリンクでその実体は `<root>/packages/lib`です。

`<root>/node_modules/lib`ディレクトリの中を眺めてみましょうか。

```
$ tree node_modules/app
node_modules/app
├── index.ts
├── node_modules
│   ├── es-toolkit -> ../../../node_modules/.bun/es-toolkit@1.43.0/node_modules/es-toolkit
│   └── lib -> ../../lib
└── package.json
```

なるほど。`packages/app`ディレクトリの中にある `index.ts` と `package.json` がルート直下の node_modules/app` としてコピーされています。こうなっているからこそ `packages/app/index.ts` がlibパッケージの内容を参照することができる。すなわちapp/index.ts のなかの `import { myShuffle } from "lib";` という参照をちゃんと解決することができる。




## アプリが動作することを確認する

packages/app/index.tsを実行してみよう

```
$ cd packages/app
$ bun run index.ts
[ 1, 2, 3, 5, 4 ]
```

はい、アプリが動きました。libパッケージが作ってexportした `myShuffle` 関数をappパッケージの index.ts がimportして利用することができました。モノレポ、一丁あがり。

## 参考情報

1. Bun公式ドキュメント [Workspaces](https://bun.com/docs/pm/workspaces)
2. d2m記事 [Bunでモノレポ環境を構築してみた](https://daichi2mori.com/blog/20241106-bun-workspace)
