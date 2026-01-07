# bun-workspaces-monorepo

[Bun workspaceで始めるモノレポ生活](https://azukiazusa.dev/blog/bun-workspace/)を写経する。

部分的に d2m記事 [Bunでモノレポ環境を構築してみた](https://daichi2mori.com/blog/20241106-bun-workspace) も参照した。

## プロジェクト構造の作成

### ルートディレクトリを作る

```
$ mkdir bun-workspaces-monorepo
$ cd  bun-workspaces-monorepo
$ bun init -y
```

ルートのpackage.jsonが作られる。

ルート直下に CLAUDE.md が作られる。これはチートシート。npmに代わってbunならどういうコマンドをタイプすべきかを教えてくれる。

### packagesディレクトリを作る

```
$ mkdir packages
```

### ルートディレクトリのpackage.jsonにworkspacesフィールドを追加する

```
{
  "name": "bun-workspaces-monorepo-example",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
...
```

### サブパッケージを作る

```
$ mkdir ./packages/lib
$ mkdir ./packages/app
```

## libパッケージを作る

```
$ touch ./packages/lib/package.json
```

./packages/lib/package.jsonの中身はこんな感じにする

```
{
  "name": "lib",
  "version": "1.0.0",
  "main": "index.ts",
  "type": "module",
  "dependencies": {
    "es-toolkit": "^1.26.1"
  }
}
```

依存するライブラリを追加してみよう。
[es-toolkit](https://es-toolkit.dev/)を追加するには次のようにする。

```
$ cd packages/lib
$ bun add es-toolkit
```

外部パッケージから参照できる関数を.index.tsに作ろう。

```
// packages/lib/index.ts
import { shuffle } from "es-toolkit";

export const myShuffle = <T>(arr: T[]): T[] = shuffule(arr);
```


## appパッケージを作る

libパッケージからmyShuffle関数をインポートし、コンソールで出力する、というデモンストレーションをappパッケージで実装する。

```
$ touch ./packages/app/package.json
```

モノレポの中にあるワークスペースの間で依存関係を追加するには dependencies フィールドに `workspace:*` を追加する。

./packages/app/package.jsonの中身はこんな感じにする

```
{
  "name": "app",
  "version": "1.0.0",
  "main": "index.ts",
  "type": "module",
  "dependencies": {
    "lib": "workpace:*"
  }
}
```

## appワークスペースがlibをimportするという依存関係を可能にする

ルートディレクトリで
```
$ bun install
```
とやる。

すると appワークスペースのindex.tsがlibのmyShuffle をimportできるようになる。

```
// packages/app/index.ts
import { myShuffle } from "lib";

const data = [1, 2, 3, 4, 5];

console.log(myShuffle(data));
```

packages/app/index.tsを実行してみよう

```
$ cd packages/app
$ bun run index.ts

```


----

Bunの公式ドキュメントの中に Workspaces に関するページがあった。

- https://bun.com/docs/pm/workspaces


