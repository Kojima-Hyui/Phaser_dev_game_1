import Phaser from 'phaser';

/**
 * WASDキーボードコントロールの型定義
 */
export interface KeyboardControls {
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
}
