import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';

// ゲームインスタンスを作成
new Phaser.Game(gameConfig);

// デバッグ用
console.log('サイバーパンク・ローグライトシューター - 起動');
console.log('Phaser version:', Phaser.VERSION);
