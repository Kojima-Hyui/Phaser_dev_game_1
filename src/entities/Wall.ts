import Phaser from 'phaser';
import { COLORS } from '@/utils/Constants';

export class Wall extends Phaser.GameObjects.Graphics {
  public body!: Phaser.Physics.Arcade.Body;
  private wallWidth: number;
  private wallHeight: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene);

    this.x = x;
    this.y = y;
    this.wallWidth = width;
    this.wallHeight = height;

    // 障害物の描画
    this.drawWall();

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // 静的ボディ（動かない）

    this.body.setSize(width, height);
    this.body.setOffset(-width / 2, -height / 2);
  }

  private drawWall(): void {
    this.clear();

    // 塗りつぶし
    this.fillStyle(COLORS.WALL, 1);
    this.fillRect(
      -this.wallWidth / 2,
      -this.wallHeight / 2,
      this.wallWidth,
      this.wallHeight
    );

    // 輪郭線
    this.lineStyle(2, COLORS.WALL_OUTLINE, 1);
    this.strokeRect(
      -this.wallWidth / 2,
      -this.wallHeight / 2,
      this.wallWidth,
      this.wallHeight
    );

    // サイバーパンク風のアクセント線
    this.lineStyle(1, COLORS.WALL_OUTLINE, 0.5);
    this.beginPath();
    this.moveTo(-this.wallWidth / 2 + 5, -this.wallHeight / 2 + 5);
    this.lineTo(this.wallWidth / 2 - 5, -this.wallHeight / 2 + 5);
    this.strokePath();
  }
}
