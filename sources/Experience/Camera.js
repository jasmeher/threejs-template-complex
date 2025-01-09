import * as THREE from "three/webgpu";
import Experience from "./Experience.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { label } from "three/tsl";

export default class Camera {
  constructor(_options) {
    // Options
    this.experience = new Experience();
    this.config = this.experience.config;
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.sizes = this.experience.sizes;
    this.targetElement = this.experience.targetElement;
    this.scene = this.experience.scene;

    // Set up
    this.mode = "debug"; // defaultCamera \ debugCamera

    this.setInstance();
    this.setModes();
  }

  setInstance() {
    // Set up
    this.instance = new THREE.PerspectiveCamera(
      25,
      this.config.width / this.config.height,
      0.1,
      150
    );
    this.instance.rotation.reorder("YXZ");

    this.scene.add(this.instance);
  }

  setModes() {
    this.modes = {};

    // Default
    this.modes.default = {};
    this.modes.default.instance = this.instance.clone();
    this.modes.default.instance.rotation.reorder("YXZ");

    // Debug
    this.modes.debug = {};
    this.modes.debug.instance = this.instance.clone();
    this.modes.debug.instance.rotation.reorder("YXZ");
    this.modes.debug.instance.position.set(5, 5, 5);

    this.modes.debug.orbitControls = new OrbitControls(
      this.modes.debug.instance,
      this.targetElement
    );
    this.modes.debug.orbitControls.enabled = this.modes.debug.active;
    this.modes.debug.orbitControls.screenSpacePanning = true;
    this.modes.debug.orbitControls.enableKeys = false;
    this.modes.debug.orbitControls.zoomSpeed = 1;
    this.modes.debug.orbitControls.enableDamping = true;
    this.modes.debug.orbitControls.update();

    /* Debug Mode */

    if (this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: "Camera",
      });

      this.debugFolder.addBinding(this, "mode", {
        options: {
          default: "default",
          debug: "debug",
        },
        label: "Camera Mode",
      });

      this.copyButton = this.debugFolder.addButton({
        title: "Sync Transform",
        label: "Sync Debug to Default Camera",
      });

      this.copyButton.on("click", (e) => {
        this.modes.default.instance.position.copy(
          this.modes.debug.instance.position
        );
        this.modes.default.instance.quaternion.copy(
          this.modes.debug.instance.quaternion
        );
        e.target.title = "Synced!";
        setTimeout(() => {
          e.target.title = "Sync Transform";
        }, 1000);
      });
    }
  }

  resize() {
    this.instance.aspect = this.config.width / this.config.height;
    this.instance.updateProjectionMatrix();

    this.modes.default.instance.aspect = this.config.width / this.config.height;
    this.modes.default.instance.updateProjectionMatrix();

    this.modes.debug.instance.aspect = this.config.width / this.config.height;
    this.modes.debug.instance.updateProjectionMatrix();
  }

  update() {
    // Update debug orbit controls

    this.modes.debug.orbitControls.update();

    // Apply coordinates
    this.instance.position.copy(this.modes[this.mode].instance.position);
    this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion);
    this.instance.updateMatrixWorld(); // To be used in projection
  }

  destroy() {
    this.modes.debug.orbitControls.destroy();
  }
}
