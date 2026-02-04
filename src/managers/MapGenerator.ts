import Phaser from 'phaser';
import { Wall } from '@/entities/Wall';
import { MAP } from '@/utils/Constants';

export enum MapPattern {
  OPEN_FIELD = 'open_field',  // ランダム配置
  ARENA = 'arena',            // 外周に障害物、中央空き
  MAZE = 'maze'               // グリッド状配置
}

export class MapGenerator {
  private scene: Phaser.Scene;
  private walls: Phaser.GameObjects.Group;
  private currentPattern: MapPattern = MapPattern.OPEN_FIELD;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.walls = scene.add.group();
  }

  public generateMap(playerX: number, playerY: number, pattern?: MapPattern): Phaser.GameObjects.Group {
    // 既存の壁をクリア
    this.walls.clear(true, true);

    // パターンを設定（指定がなければランダム）
    if (pattern) {
      this.currentPattern = pattern;
    } else {
      const patterns = Object.values(MapPattern);
      this.currentPattern = Phaser.Utils.Array.GetRandom(patterns);
    }

    // パターンに応じてマップを生成
    switch (this.currentPattern) {
      case MapPattern.OPEN_FIELD:
        this.generateOpenField(playerX, playerY);
        break;
      case MapPattern.ARENA:
        this.generateArena(playerX, playerY);
        break;
      case MapPattern.MAZE:
        this.generateMaze(playerX, playerY);
        break;
    }

    // マップの境界壁を作成
    this.createBoundaryWalls();

    return this.walls;
  }

  private generateOpenField(playerX: number, playerY: number): void {
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
  }

  private generateArena(playerX: number, playerY: number): void {
    // 外周に障害物を配置（中央は空き）
    const margin = 150;
    const wallSize = 80;
    const spacing = 200;

    // 上辺
    for (let x = margin; x < MAP.WIDTH - margin; x += spacing) {
      if (!this.isInSafeZone(x, margin, playerX, playerY)) {
        const wall = new Wall(this.scene, x, margin, wallSize, wallSize);
        this.walls.add(wall);
      }
    }

    // 下辺
    for (let x = margin; x < MAP.WIDTH - margin; x += spacing) {
      if (!this.isInSafeZone(x, MAP.HEIGHT - margin, playerX, playerY)) {
        const wall = new Wall(this.scene, x, MAP.HEIGHT - margin, wallSize, wallSize);
        this.walls.add(wall);
      }
    }

    // 左辺
    for (let y = margin + spacing; y < MAP.HEIGHT - margin; y += spacing) {
      if (!this.isInSafeZone(margin, y, playerX, playerY)) {
        const wall = new Wall(this.scene, margin, y, wallSize, wallSize);
        this.walls.add(wall);
      }
    }

    // 右辺
    for (let y = margin + spacing; y < MAP.HEIGHT - margin; y += spacing) {
      if (!this.isInSafeZone(MAP.WIDTH - margin, y, playerX, playerY)) {
        const wall = new Wall(this.scene, MAP.WIDTH - margin, y, wallSize, wallSize);
        this.walls.add(wall);
      }
    }

    // 四隅に大きな障害物
    const cornerSize = 120;
    const cornerOffset = 250;
    const corners = [
      { x: cornerOffset, y: cornerOffset },
      { x: MAP.WIDTH - cornerOffset, y: cornerOffset },
      { x: cornerOffset, y: MAP.HEIGHT - cornerOffset },
      { x: MAP.WIDTH - cornerOffset, y: MAP.HEIGHT - cornerOffset }
    ];

    for (const corner of corners) {
      if (!this.isInSafeZone(corner.x, corner.y, playerX, playerY)) {
        const wall = new Wall(this.scene, corner.x, corner.y, cornerSize, cornerSize);
        this.walls.add(wall);
      }
    }
  }

  private generateMaze(playerX: number, playerY: number): void {
    // グリッド状に障害物を配置（通路型）
    const gridSize = 300;
    const wallWidth = 60;
    const wallLength = 150;

    for (let gx = 1; gx < Math.floor(MAP.WIDTH / gridSize); gx++) {
      for (let gy = 1; gy < Math.floor(MAP.HEIGHT / gridSize); gy++) {
        const x = gx * gridSize;
        const y = gy * gridSize;

        if (this.isInSafeZone(x, y, playerX, playerY)) {
          continue;
        }

        // ランダムに縦または横の壁を配置
        if (Math.random() > 0.5) {
          // 縦壁
          const wall = new Wall(this.scene, x, y, wallWidth, wallLength);
          this.walls.add(wall);
        } else {
          // 横壁
          const wall = new Wall(this.scene, x, y, wallLength, wallWidth);
          this.walls.add(wall);
        }
      }
    }
  }

  public getCurrentPattern(): MapPattern {
    return this.currentPattern;
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
