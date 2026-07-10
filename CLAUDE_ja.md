## デフォルトでNode.jsの代わりにBunを使うべし

- `node <file>` や `ts-node <file>` の代わりに `bun <file>` を使うべし
- `jest` や `vitest` の代わりに `bun test` を使うべし
- `webpack` や `esbuild` の代わりに `bun build <file.html|file.ts|file.css>` を使うべし
- 「npm install」や「yarn install」や「pnpm install」の代わりに「bun install」を使うべし

## API

- `Bun.serve()` は WebSocketsとHTTPSとルーティングをサポートしている。 `express` を使うべからず。
- SQLiteがほしければ `bun:sqlite` を使うべし。 `better-sqlite3` を使うべからず。
- Redisがほしければ `Bun.redis` を使うべし。 `ioredis` を使うべからず。
- Postgressがほしければ `Bun.sql` を使うべし。 `pg` とか `postgres.js` を使うべからず。
- `WebSocket` はBunに組み込まれている。 `ws` を使うべからず。
- readFile/writeFileしたければ `Bun.file` を使うべし。 `node:fs` を使うべからず。
- Bun.$`ls` を使うべし。 `execa` を使うべからず。

## テスト

テストを実行するには `bun test` を使うべし。

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## フロント・エンド

HTMLをimportして `Bun.serve()` に渡すべし。`vite` を使うべからず。HTML import は React,CSS, Tailwind をフルにサポートしている。

Serverのサンプル:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML が .tsx や .jsx や .js ファイルを直接インポートすルコともできる。Bunのbundlerがトランスパイルとバンドルの処理を自動的に行う。`<link>` がstylesheetを参照して、BunのCSS Bundlerがstylesheetをバンドルすることができる。

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

ちなみに `frontend.tsx` はこんなふう:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

`index.ts` を実行するにはこうする:

```sh
bun --hot ./index.ts
```

より詳しい情報が必要なら、Bun APIのドキュメント `node_modules/bun-types/docs/**.mdx` を参照のこと.
