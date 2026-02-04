import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 将来的にアセットをロードする場合はここに記述
    // 現在はプログラム生成の幾何学形状のみなので不要
  }

  create(): void {
    // メインゲームシーンとUIシーンを起動
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
