import Phaser from 'phaser';
import { Wall } from '@/entities/Wall';
import { MAP } from '@/utils/Constants';

export class MapGenerator {
  private scene: Phaser.Scene;
  private walls: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.walls = scene.add.group();
  }

  public generateMap(playerX: number, playerY: number): Phaser.GameObjects.Group {
    // 既存の壁をクリア
    this.walls.clear(true, true);

    // ランダムに障害物を配置
    for (let i = 0; i < MAP.WALL_COUNT; i++) {
      let x, y, width, height;
      let attempts = 0;
      const maxAttempts = 50;

      // プレイヤーの安全地帯外に配置されるまで試行
      do {
        x = Phaser.Math.Between(100, MAP.WIDTH - 100);
        y = Phaser.Math.Between(100, MAP.HEIGHT - 100);
        width = Phaser.Math.Between(MAP.WALL_MIN_SIZE, MAP.WALL_MAX_SIZE);
        height = Phaser.Math.Between(MAP.WALL_MIN_SIZE, MAP.WALL_MAX_SIZE);

        attempts++;
        if (attempts >= maxAttempts) break;
      } while (this.isInSafeZone(x, y, playerX, playerY));

      // 障害物を作成
      const wall = new Wall(this.scene, x, y, width, height);
      this.walls.add(wall);
    }

    // マップの境界壁を作成
    this.createBoundaryWalls();

    return this.walls;
  }

  private isInSafeZone(x: number, y: number, playerX: number, playerY: number): boolean {
    const distance = Phaser.Math.Distance.Between(x, y, playerX, playerY);
    return distance < MAP.SAFE_ZONE_RADIUS;
  }

  private createBoundaryWalls(): void {
    const thickness = 50;

    // 上の壁
    const topWall = new Wall(this.scene, MAP.WIDTH / 2, thickness / 2, MAP.WIDTH, thickness);
    this.walls.add(topWall);

    // 下の壁
    const bottomWall = new Wall(
      this.scene,
      MAP.WIDTH / 2,
      MAP.HEIGHT - thickness / 2,
      MAP.WIDTH,
      thickness
    );
    this.walls.add(bottomWall);

    // 左の壁
    const leftWall = new Wall(this.scene, thickness / 2, MAP.HEIGHT / 2, thickness, MAP.HEIGHT);
    this.walls.add(leftWall);

    // 右の壁
    const rightWall = new Wall(
      this.scene,
      MAP.WIDTH - thickness / 2,
      MAP.HEIGHT / 2,
      thickness,
      MAP.HEIGHT
    );
    this.walls.add(rightWall);
  }

  public getWalls(): Phaser.GameObjects.Group {
    return this.walls;
  }
}
