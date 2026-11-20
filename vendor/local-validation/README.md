# 本地双版本校验包

这些 tarball 仅用于 npm ci / npm test，不代表 npm 已发布。模板作者获得的项目不包含它们。分别在冻结 v2 和 v3 工具链运行 npm run build，再在各自 packages/sdk 和 packages/issuer 运行 npm pack --ignore-scripts --pack-destination <此目录>。更新后在模板仓库运行 npm install --package-lock-only 和 npm ci，确认两版 issuer 内部依赖各自的 SDK。
