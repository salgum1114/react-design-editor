# Ant Design v3 -> v6 Migration

Checked against the official Ant Design docs on 2026-05-09.

## Official references

- Ant Design v3 -> v4 migration: https://4x.ant.design/docs/react/migration-v4
- Ant Design v5 -> v6 migration: https://ant.design/docs/react/migration-v6/
- Ant Design introduction / environment support: https://ant.design/docs/react/introduce/
- Tabs API (`items`, `tabPlacement`, deprecated `tabPosition`): https://ant.design/components/tabs/
- Modal API (`open`, semantic `styles`): https://ant.design/components/modal/

## Important compatibility decision

This repository now targets `antd@6`.

Per the official v6 migration guide, `antd@6` requires `React >= 18` and no longer supports React 17 or earlier. Because of that, the package metadata was updated to support React `18.x` and `19.x`, not `16.x` through `19.x`.

If React 16 or 17 support is a hard requirement, this project cannot stay on `antd@6`; it would need to remain on antd v5 or below, or be split into different release lines.

## What changed

### Dependency updates

- `antd` upgraded from `^3.15.0` to `^6.0.0`
- `@ant-design/icons` added at `^6.1.0`
- `react` / `react-dom` upgraded to `^19.1.0`
- `@types/react` / `@types/react-dom` upgraded to `^19.1.5`
- `less` upgraded to `^4.3.0`
- `peerDependencies.react` / `peerDependencies.react-dom` changed to `>=18 <20`
- removed `@hot-loader/react-dom`
- removed `babel-plugin-import`

### Runtime / entry migration

- Replaced `LocaleProvider` with `ConfigProvider`
- Replaced `react-dom` legacy render with `createRoot` from `react-dom/client`
- Switched locale imports to `antd/locale/*`
- Added `antd/dist/reset.css`

Files:

- `src/index.tsx`
- `package.json`

### antd compatibility layer

Added `src/antd-compat.tsx` and aliased `antd` to it in `vite.config.ts`.

This layer keeps the existing codebase running while moving to `antd@6` by:

- mapping legacy `Form.create()` usage onto modern `Form` internals
- mapping legacy `getFieldDecorator()` calls to `Form.Item`
- translating `validateFields`, `resetFields`, and `getFieldsError` to the newer form API
- translating `Modal visible` to `open`
- translating `Modal bodyStyle` / `maskStyle` to semantic `styles`
- translating `Tooltip` / `Popover` `visible` and overlay style props
- translating `Tabs.TabPane` children and `tabPosition` to modern `items` / `tabPlacement`

Files:

- `src/antd-compat.tsx`
- `vite.config.ts`

### Component-level fixes

- Replaced removed antd `Icon` usage in file upload with `InboxOutlined`
- Removed old `antd/lib/menu` type import usage in `Title.tsx`
- Removed old `antd/lib/form` type imports from workflow form containers
- Replaced a removed Less palette token (`@primary-5`) with `@primary-color`
- Updated React 19 `useRef()` typing sites to initialize with `null`

Files:

- `src/components/common/FileUpload.js`
- `src/components/layout/Title.tsx`
- `src/editors/workflow/WorkflowNodeConfigurations.tsx`
- `src/editors/workflow/WorkflowInfo.tsx`
- `src/editors/workflow/WorkflowGlobalParameters.tsx`
- `src/styles/antd/inputnumber/index.less`
- `src/canvas/Canvas.tsx`
- `src/editors/fiber/FiberEditor.tsx`
- `src/editors/hexgrid/HexGridEditor.tsx`

## Verification

Executed after dependency install:

- `npm install`
- `npm run build:demo`
- `npm run build:lib`

Both build commands completed successfully on 2026-05-09.

## Notes / residual risk

- The project still contains many v3-era component call sites such as `Form.create`, `visible`, `Tabs.TabPane`, and `tabPosition`, but they now run through the compatibility layer instead of failing immediately on `antd@6`.
- This keeps the migration tractable without rewriting every form to `Form.useForm` in one pass.
- Custom styles that target internal antd DOM may still need visual regression review, which is also called out by the official v6 migration guide.
