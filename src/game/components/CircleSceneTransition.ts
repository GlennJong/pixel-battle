
import Phaser from "phaser";
import { runTween } from "../utils/runTween";

const maskCoverColor = 0x000000;
const SPEED = 0.3; // pixels per millisecond

export async function sceneConverter(
  scene: Phaser.Scene,
  nextSceneName?: string,
  data?: { [key: string]: unknown },
) {
  const { scene: sceneController } = scene;
  const cover = new CircleScreenTransition(scene);

  await cover.runMask();

  // move to next scene
  if (typeof nextSceneName !== "undefined") {
    sceneController.start(nextSceneName, data);
  }
}

export async function sceneStarter(scene: Phaser.Scene) {
  const cover = new CircleScreenTransition(scene);

  await cover.runUnmask();
}

export async function sceneFinisher(scene: Phaser.Scene) {
  const cover = new CircleScreenTransition(scene);
  
  await cover.runMask();
}

class CircleScreenTransition extends Phaser.GameObjects.Container {
  private visibleArea: Phaser.GameObjects.Arc;
  private curcleMaxSize: number;

  constructor(scene: Phaser.Scene) {
    super(scene);

    const { zoom } = scene.scale;
    const { width, height } = scene.sys.game.canvas;
    
    this.curcleMaxSize = Math.max(width * zoom, height * zoom);

    const coverRect = scene.add
      .rectangle(0, 0, width * zoom, height * zoom, maskCoverColor)
      .setOrigin(0)
      .setDepth(9999)
      .setVisible(true);
      
    const visibleArea = scene.add
      .circle(width / 2, height / 2, 0, maskCoverColor)
      .setVisible(false);

    this.visibleArea = visibleArea;

    const mask = visibleArea.createGeometryMask();

    mask.invertAlpha = true;
    coverRect.setMask(mask);
    this.setDepth(9999);
  }

  public async runMask() {
    this.visibleArea.setRadius(this.curcleMaxSize);
    const duration = this.visibleArea.radius / SPEED;
    await runTween(
      this.visibleArea,
      { radius: 0 },
      duration,
      Phaser.Math.Easing.Quadratic.In,
    );
    return;
  }
  public async runUnmask() {
    this.visibleArea.setRadius(0);
    const duration = (this.curcleMaxSize - this.visibleArea.radius) / SPEED;
    await runTween(
      this.visibleArea,
      { radius: this.curcleMaxSize },
      duration,
      Phaser.Math.Easing.Quadratic.Out,
    );
    return;
  }
}
