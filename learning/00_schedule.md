# 製造DX学習ロードマップ

> 更新日：2026-04-18  
> 学習条件：週6h以上 ／ スタイル：理論→実例→対話問答  
> 問答形式：知識確認問題 ＋ シナリオ問題 を交互

---

## 全体スケジュール（16週・4ヶ月）

### Phase 1：基盤理解（Month 1）

| 週 | テーマ | 優先度 | 詳細ファイル |
|----|--------|--------|------------|
| Week 1 | 事業と経営の理解 ＋ 受注生産・個別仕様製造の理解 | 基盤 | [01_business.md](01_business.md) / [02_eto_mto.md](02_eto_mto.md) |
| Week 2 | 業務設計（前半）：流れ・判断点・責任分担・承認 | ★1位 | [03_biz_process.md](03_biz_process.md) |
| Week 3 | 業務設計（後半）：例外処理・属人化防止・手戻り削減 | ★1位 | [03_biz_process.md](03_biz_process.md) |
| Week 4 | 設計変更管理（ECM）| ★2位 | [04_ecm.md](04_ecm.md) |

### Phase 2：製造展開と記録（Month 2）

| 週 | テーマ | 優先度 | 詳細ファイル |
|----|--------|--------|------------|
| Week 5 | 製造展開（前半）：E-BOM/M-BOM・工程表 | ★3位 | [05_mfg_deployment.md](05_mfg_deployment.md) |
| Week 6 | 製造展開（後半）：作業手順・検査・外注条件 | ★3位 | [05_mfg_deployment.md](05_mfg_deployment.md) |
| Week 7 | 記録情報設計：主キー・改訂履歴・欠損値対策 | ★4位 | [10_record_design.md](10_record_design.md) |
| Week 8 | 品質管理・統計解析（前半）：平均・標準偏差・Cp/Cpk | ★5位 | [07_quality_stats.md](07_quality_stats.md) |

### Phase 3：品質・設備・運用（Month 3）

| 週 | テーマ | 優先度 | 詳細ファイル |
|----|--------|--------|------------|
| Week 9 | 品質管理・統計解析（後半）：管理図・異常検知・MSA/GRR | ★5位 | [07_quality_stats.md](07_quality_stats.md) |
| Week 10 | 生産技術の基礎：工程設計・加工ばらつき・治工具 | ★6位 | [06_mfg_tech.md](06_mfg_tech.md) |
| Week 11 | 設備と保全：台帳・予防保全・予知保全・停止要因 | 支援 | [08_equipment.md](08_equipment.md) |
| Week 12 | 標準化と教育：標準書・用語統一・変更時教育 | ★7位 | [15_standardization.md](15_standardization.md) |

### Phase 4：統合と展開（Month 4）

| 週 | テーマ | 優先度 | 詳細ファイル |
|----|--------|--------|------------|
| Week 13 | 情報基盤 ＋ 調達・外注・取引先連携 | 支援 | [11_it_infra.md](11_it_infra.md) / [09_procurement.md](09_procurement.md) |
| Week 14 | AI活用条件 ＋ 導入条件設計（PoC設計） | ★8位 | [12_ai.md](12_ai.md) / [13_poc.md](13_poc.md) |
| Week 15 | 運用設計 ＋ 効果測定（KPI・投資回収） | 統合 | [14_operations.md](14_operations.md) / [16_kpi.md](16_kpi.md) |
| Week 16 | 総復習・弱点補強・業務適用確認 | 統合 | — |

---

## 各週のセッション構成（週3セッション × 2時間）

```
Session 1（2h）：理論インプット
  定義・背景・なぜ必要か
  具体的な現場場面での解説
  知識確認Q&A（用語・概念）

Session 2（2h）：深化
  関連概念との接続
  業務シナリオQ&A（判断演習）
  誤解しやすいポイント確認

Session 3（2h）：定着
  前週との繋がり確認
  総合シナリオ問題（複合判断）
  次週テーマの予告・接続
  今週の3行要約演習
```

---

## 学習ログ

| 日付 | Week | 実施内容 | 理解度（★5） | 気づき・メモ |
|------|------|---------|------------|------------|
| 2026-04-18 | W1 S1 | 開始準備・資料整備 | — | — |

---

## 関連ファイル一覧

| ファイル | 内容 |
|---------|------|
| [00_schedule.md](00_schedule.md) | このファイル：全体スケジュール・ログ |
| [01_business.md](01_business.md) | 事業と経営の理解 |
| [02_eto_mto.md](02_eto_mto.md) | 受注生産・個別仕様製造 |
| [03_biz_process.md](03_biz_process.md) | 業務設計 |
| [04_ecm.md](04_ecm.md) | 設計変更管理（ECM） |
| [05_mfg_deployment.md](05_mfg_deployment.md) | 製造展開・BOM |
| [06_mfg_tech.md](06_mfg_tech.md) | 生産技術の基礎 |
| [07_quality_stats.md](07_quality_stats.md) | 品質管理・統計解析 |
| [08_equipment.md](08_equipment.md) | 設備・保全 |
| [09_procurement.md](09_procurement.md) | 調達・外注・取引先連携 |
| [10_record_design.md](10_record_design.md) | 記録情報設計 |
| [11_it_infra.md](11_it_infra.md) | 情報基盤（ERP/MES/PLM/QMS） |
| [12_ai.md](12_ai.md) | AI活用条件 |
| [13_poc.md](13_poc.md) | 導入条件設計・PoC |
| [14_operations.md](14_operations.md) | 運用設計 |
| [15_standardization.md](15_standardization.md) | 標準化と教育 |
| [16_kpi.md](16_kpi.md) | 効果測定・KPI |
| [99_frameworks.md](99_frameworks.md) | フレームワーク・規格・用語大全 |
| [99_references.md](99_references.md) | 参考文献・書籍・論文 完全一覧 |
