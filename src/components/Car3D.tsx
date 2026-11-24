"use client";
// 3D-машинка для блока «Услуги»: игрушечная машинка FOX на поворотном подиуме.
// Выбор узла (кнопкой, точкой или тапом по детали) открывает нужную часть:
//   engine     — открывается капот, камера к двигателю
//   service    — капот + светятся крышки жидкостей
//   wheels     — колесо выезжает и крутится, светится тормозной диск
//   suspension — машина поднимается на подъёмнике, видны амортизаторы и пружины
//   extras     — открывается багажник, поднимается ящик
// three.js грузится только когда блок рядом с экраном. Кадр рисуется только во время
// движения (анимация, поворот пальцем), в покое GPU не работает.
// Пока грузится или если WebGL нет — показываем картинку-заглушку (children).
import { useEffect, useRef, useState } from "react";
import type * as T from "three";

type Zone = { id: string; label: string };
type Props = { zones: Zone[]; cur: string; onPick: (id: string) => void; children?: React.ReactNode };

// Точки-подписи в координатах машины (x вперёд, y вверх, z к зрителю)
const ANCHORS: Record<string, [number, number, number]> = {
  engine: [1.6, 1.2, -0.2],
  service: [1.2, 1.0, 0.62],
  wheels: [1.35, 0.42, 1.12],
  suspension: [-1.35, 0.95, 1.0],
  extras: [-1.7, 1.2, 0],
};
// Камера: [позиция], [куда смотрит]
const CAMS: Record<string, [[number, number, number], [number, number, number]]> = {
  home: [[5.4, 3.1, 6.2], [0, 0.75, 0]],
  engine: [[5.3, 3.9, 4.3], [0.9, 0.8, 0]],
  service: [[4.9, 3.7, 4.8], [0.95, 0.85, 0.2]],
  wheels: [[4.3, 1.8, 5.7], [0.9, 0.6, 0.8]],
  suspension: [[4.2, 1.7, 6.3], [0, 1.2, 0]],
  extras: [[-5.4, 3.7, 4.5], [-0.85, 0.85, 0]],
};

export default function Car3D({ zones, cur, onPick, children }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const pins = useRef<(HTMLButtonElement | null)[]>([]);
  const api = useRef<{ select: (id: string) => void } | null>(null);
  const pickRef = useRef(onPick);
  const curRef = useRef(cur);
  const [state, setState] = useState<"wait" | "ready" | "fail">("wait");

  pickRef.current = onPick;

  useEffect(() => {
    curRef.current = cur;
    api.current?.select(cur);
  }, [cur]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let dispose: (() => void) | undefined;
    let dead = false;

    const start = async () => {
      let three: typeof import("three");
      let RoundedBox: typeof import("three/examples/jsm/geometries/RoundedBoxGeometry.js").RoundedBoxGeometry;
      let RoomEnv: typeof import("three/examples/jsm/environments/RoomEnvironment.js").RoomEnvironment;
      try {
        three = await import("three");
        RoundedBox = (await import("three/examples/jsm/geometries/RoundedBoxGeometry.js")).RoundedBoxGeometry;
        RoomEnv = (await import("three/examples/jsm/environments/RoomEnvironment.js")).RoomEnvironment;
      } catch { if (!dead) setState("fail"); return; }
      if (dead) return;
      try {
        dispose = build(three, RoundedBox, RoomEnv);
        setState("ready");
      } catch { setState("fail"); }
    };

    const build = (
      THREE: typeof import("three"),
      RoundedBoxGeometry: typeof import("three/examples/jsm/geometries/RoundedBoxGeometry.js").RoundedBoxGeometry,
      RoomEnvironment: typeof import("three/examples/jsm/environments/RoomEnvironment.js").RoomEnvironment,
    ) => {
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.className = "c3-canvas";
      el.prepend(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.55;

      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

      // свет: ключевой белый + рыжий контровой
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(5, 8, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xf47634, 1.6);
      rim.position.set(-6, 3, -5);
      scene.add(rim);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x221100, 0.35));

      // ---------- материалы ----------
      const M = {
        body: new THREE.MeshPhysicalMaterial({ color: 0xf47634, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15 }),
        black: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5, metalness: 0.2 }),
        glass: new THREE.MeshPhysicalMaterial({ color: 0x0b0d10, roughness: 0.08, metalness: 0.4, clearcoat: 1 }),
        tire: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 }),
        rim: new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.25, metalness: 0.9 }),
        steel: new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 0.35, metalness: 0.8 }),
        dark: new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.6, metalness: 0.5 }),
        glow: new THREE.MeshStandardMaterial({ color: 0xff8d4f, emissive: 0xf47634, emissiveIntensity: 0.2, roughness: 0.4 }),
        disc: new THREE.MeshStandardMaterial({ color: 0x8a8a8a, emissive: 0xf47634, emissiveIntensity: 0, roughness: 0.3, metalness: 0.9 }),
        head: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3e0, emissiveIntensity: 1.4 }),
        tail: new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff1a1a, emissiveIntensity: 1.2 }),
        floor: new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.9, metalness: 0 }),
        ring: new THREE.MeshBasicMaterial({ color: 0xf47634 }),
        lift: new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.7 }),
      };
      const geos: T.BufferGeometry[] = [];
      const rbox = (w: number, h: number, d: number, r = 0.06) => { const g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)); geos.push(g); return g; };
      const mesh = (g: T.BufferGeometry, m: T.Material, x: number, y: number, z: number, zone?: string, parent?: T.Object3D) => {
        const o = new THREE.Mesh(g, m);
        o.position.set(x, y, z);
        if (zone) o.userData.zone = zone;
        (parent ?? car).add(o);
        return o;
      };

      // ---------- подиум ----------
      const stage = new THREE.Group();
      scene.add(stage);
      const floorG = new THREE.CylinderGeometry(3.4, 3.5, 0.12, 64); geos.push(floorG);
      const floor = new THREE.Mesh(floorG, M.floor); floor.position.y = -0.06; stage.add(floor);
      const ringG = new THREE.TorusGeometry(3.42, 0.025, 8, 96); geos.push(ringG);
      const ring = new THREE.Mesh(ringG, M.ring); ring.rotation.x = Math.PI / 2; ring.position.y = 0.005; stage.add(ring);
      // мягкая тень под машиной
      const sh = document.createElement("canvas"); sh.width = sh.height = 128;
      const sx = sh.getContext("2d")!; const grd = sx.createRadialGradient(64, 64, 4, 64, 64, 64);
      grd.addColorStop(0, "rgba(0,0,0,0.85)"); grd.addColorStop(1, "rgba(0,0,0,0)"); sx.fillStyle = grd; sx.fillRect(0, 0, 128, 128);
      const shTex = new THREE.CanvasTexture(sh);
      const shG = new THREE.PlaneGeometry(5.6, 3.0); geos.push(shG);
      const shadow = new THREE.Mesh(shG, new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; stage.add(shadow);

      // ---------- машина ----------
      const yaw = new THREE.Group(); stage.add(yaw);         // поворот пальцем
      const lift = new THREE.Group(); yaw.add(lift);         // подъёмник
      const car = new THREE.Group(); lift.add(car);

      // днище и средняя часть кузова
      mesh(rbox(4.2, 0.12, 1.86, 0.05), M.black, 0, 0.5, 0);
      mesh(rbox(2.24, 0.64, 1.9, 0.08), M.body, -0.1, 0.77, 0);
      // моторный отсек: боковины, передняя панель, бампер, фары, решётка
      for (const z of [-0.89, 0.89]) mesh(rbox(1.12, 0.64, 0.12, 0.05), M.body, 1.56, 0.77, z, "engine");
      mesh(rbox(0.16, 0.64, 1.9, 0.06), M.body, 2.03, 0.77, 0, "engine");
      mesh(rbox(0.24, 0.26, 1.96, 0.08), M.black, 2.12, 0.56, 0);
      mesh(rbox(0.05, 0.22, 0.9, 0.03), M.black, 2.12, 0.84, 0);
      for (const z of [-0.62, 0.62]) mesh(rbox(0.06, 0.15, 0.38, 0.03), M.head, 2.12, 0.88, z);
      // багажный отсек
      for (const z of [-0.89, 0.89]) mesh(rbox(0.92, 0.64, 0.12, 0.05), M.body, -1.66, 0.77, z, "extras");
      mesh(rbox(0.16, 0.64, 1.9, 0.06), M.body, -2.03, 0.77, 0, "extras");
      mesh(rbox(0.24, 0.26, 1.96, 0.08), M.black, -2.12, 0.56, 0);
      for (const z of [-0.66, 0.66]) mesh(rbox(0.06, 0.14, 0.42, 0.03), M.tail, -2.12, 0.9, z);
      // салон: тонированное стекло, рыжая крыша с «кнопками» как у конструктора
      mesh(rbox(1.86, 0.6, 1.72, 0.12), M.glass, -0.2, 1.38, 0);
      mesh(rbox(1.0, 0.04, 1.74, 0.02), M.black, -0.12, 1.12, 0); // линия дверей
      mesh(rbox(1.74, 0.1, 1.62, 0.05), M.body, -0.2, 1.72, 0);
      const studG = new THREE.CylinderGeometry(0.13, 0.13, 0.08, 20); geos.push(studG);
      for (const sxp of [-0.8, -0.2, 0.4]) for (const szp of [-0.45, 0.45]) mesh(studG, M.body, sxp, 1.8, szp);
      for (const z of [-1.0, 1.0]) mesh(rbox(0.16, 0.1, 0.14, 0.03), M.body, 0.72, 1.2, z); // зеркала
      // двери: стойка-разделитель
      for (const z of [-0.955, 0.955]) mesh(rbox(0.03, 0.56, 0.01, 0.005), M.black, -0.15, 0.78, z);

      // логотип FOX на дверях
      const tl = new THREE.TextureLoader();
      const logoTex = tl.load("/brand/logo-all.png", () => invalidate());
      logoTex.colorSpace = THREE.SRGBColorSpace;
      const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, color: 0xffffff, transparent: true, depthWrite: false });
      const logoG = new THREE.PlaneGeometry(1.25, 1.25 * 892 / 1832); geos.push(logoG);
      const l1 = mesh(logoG, logoMat, -0.1, 0.77, 0.956); l1.renderOrder = 2;
      const l2 = mesh(logoG, logoMat, -0.1, 0.77, -0.956); l2.rotation.y = Math.PI; l2.renderOrder = 2;

      // двигатель (под капотом)
      const engine = new THREE.Group(); car.add(engine);
      mesh(rbox(0.72, 0.36, 1.1, 0.06), M.dark, 1.5, 0.74, 0, "engine", engine);
      mesh(rbox(0.6, 0.1, 0.9, 0.04), M.steel, 1.5, 0.96, 0, "engine", engine);
      const pipeG = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 12); geos.push(pipeG);
      for (const z of [-0.3, -0.1, 0.1, 0.3]) { const p = mesh(pipeG, M.steel, 1.32, 0.95, z, "engine", engine); p.rotation.z = Math.PI / 2.6; }
      mesh(rbox(0.3, 0.26, 0.34, 0.04), M.black, 1.2, 0.8, 0.6, "service", engine); // аккумулятор
      const capG = new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16); geos.push(capG);
      const caps = [mesh(capG, M.glow, 1.82, 1.0, 0.55, "service", engine), mesh(capG, M.glow, 1.82, 1.0, -0.55, "service", engine), mesh(capG, M.glow, 1.62, 1.04, 0.2, "service", engine)];

      // капот: петля у лобового стекла
      const hood = new THREE.Group(); hood.position.set(0.99, 1.09, 0); car.add(hood);
      mesh(rbox(1.14, 0.07, 1.88, 0.03), M.body, 0.57, 0, 0, "engine", hood);
      for (const z of [-0.3, 0.3]) mesh(studG, M.body, 0.6, 0.06, z, "engine", hood);

      // багажник: петля у заднего стекла
      const trunk = new THREE.Group(); trunk.position.set(-1.21, 1.09, 0); car.add(trunk);
      mesh(rbox(0.94, 0.07, 1.88, 0.03), M.body, -0.47, 0, 0, "extras", trunk);
      const toolbox = new THREE.Group(); toolbox.position.set(-1.65, 0.75, 0); car.add(toolbox);
      mesh(rbox(0.5, 0.3, 0.9, 0.04), M.black, 0, 0, 0, "extras", toolbox);
      mesh(rbox(0.06, 0.06, 0.5, 0.02), M.glow, 0, 0.19, 0, "extras", toolbox);

      // колёса + тормоза + амортизаторы
      const tireG = new THREE.CylinderGeometry(0.42, 0.42, 0.34, 40); geos.push(tireG);
      const rimG = new THREE.CylinderGeometry(0.26, 0.26, 0.36, 24); geos.push(rimG);
      const discG = new THREE.CylinderGeometry(0.22, 0.22, 0.03, 32); geos.push(discG);
      const hubG = new THREE.CylinderGeometry(0.07, 0.07, 0.38, 12); geos.push(hubG);
      const coilPts: T.Vector3[] = []; for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 12; coilPts.push(new THREE.Vector3(Math.cos(a) * 0.09, i / 120, Math.sin(a) * 0.09)); }
      const coilG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 240, 0.018, 6); geos.push(coilG);
      const shockG = new THREE.CylinderGeometry(0.035, 0.035, 1, 10); geos.push(shockG);
      type Wheel = { g: T.Group; spin: T.Group; coil: T.Mesh; shock: T.Mesh; x: number; z: number; disc: T.Mesh };
      const wheels: Wheel[] = [];
      for (const x of [1.35, -1.35]) for (const z of [0.86, -0.86]) {
        const g = new THREE.Group(); g.position.set(x, 0.42, z); car.add(g);
        const spin = new THREE.Group(); g.add(spin);
        const zone = x > 0 && z > 0 ? "wheels" : x < 0 ? "suspension" : "wheels";
        const t = mesh(tireG, M.tire, 0, 0, 0, zone, spin); t.rotation.x = Math.PI / 2;
        const r = mesh(rimG, M.rim, 0, 0, 0, zone, spin); r.rotation.x = Math.PI / 2; r.scale.set(1, 1, 1);
        const hub = mesh(hubG, M.body, 0, 0, 0, zone, spin); hub.rotation.x = Math.PI / 2;
        const spokeG = rbox(0.44, 0.06, 0.37, 0.02);
        for (let k = 0; k < 3; k++) { const s = mesh(spokeG, M.steel, 0, 0, 0, zone, spin); s.rotation.z = k * Math.PI / 3; }
        const disc = mesh(discG, M.disc, 0, 0, z > 0 ? -0.2 : 0.2, zone, g); disc.rotation.x = Math.PI / 2;
        mesh(rbox(0.16, 0.12, 0.08, 0.03), M.glow, 0.17, 0.12, z > 0 ? -0.2 : 0.2, zone, g); // суппорт
        const coil = mesh(coilG, M.glow, 0, 0, z > 0 ? -0.36 : 0.36, "suspension", g);
        const shock = mesh(shockG, M.steel, 0, 0, z > 0 ? -0.36 : 0.36, "suspension", g);
        wheels.push({ g, spin, coil, shock, x, z, disc });
      }

      // подъёмник-ножницы под машиной (появляется при «Подвеска»)
      const liftRig = new THREE.Group(); yaw.add(liftRig);
      const BAR = 2.2;
      const platform = mesh(rbox(2.6, 0.08, 1.3, 0.03), M.lift, -0.1, 0, 0, "suspension", liftRig);
      mesh(rbox(2.6, 0.06, 1.3, 0.03), M.lift, -0.1, 0.03, 0, undefined, liftRig);
      const bars: T.Mesh[] = [];
      for (const z of [-0.55, 0.55]) for (const d of [1, -1]) {
        const b = mesh(rbox(BAR, 0.07, 0.07, 0.02), M.glow, -0.1, 0, z, "suspension", liftRig);
        b.userData.d = d; bars.push(b);
      }

      // ---------- анимация к целям ----------
      const S = { hood: 0, trunk: 0, lift: 0, wheel: 0, glow: 0, box: 0, yaw: 0 };
      const target = { ...S };
      const cam = { p: new THREE.Vector3(...CAMS.home[0]), l: new THREE.Vector3(...CAMS.home[1]) };
      const camT = { p: cam.p.clone(), l: cam.l.clone() };
      let spinA = 0, pulse = 0;

      const select = (id: string) => {
        target.hood = id === "engine" ? 1.1 : id === "service" ? 0.95 : 0;
        target.trunk = id === "extras" ? 1.15 : 0;
        target.box = id === "extras" ? 1 : 0;
        target.lift = id === "suspension" ? 1 : 0;
        target.wheel = id === "wheels" ? 1 : 0;
        target.glow = id === "service" ? 1 : 0;
        target.yaw = 0;
        const c = CAMS[id] ?? CAMS.home;
        camT.p.set(...c[0]); camT.l.set(...c[1]);
        invalidate();
      };

      // ---------- размер ----------
      let W = 1, H = 1;
      const resize = () => {
        W = el.clientWidth; H = el.clientHeight;
        renderer.setSize(W, H, false);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        invalidate();
      };
      const ro = new ResizeObserver(resize); ro.observe(el);

      // ---------- кадр ----------
      let raf = 0, last = performance.now(), dragging = false;
      const v = new THREE.Vector3();
      const near = (a: number, b: number) => Math.abs(a - b) < 0.0015;
      function invalidate() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

      function frame(now: number) {
        raf = 0;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        const k = still ? 1 : 1 - Math.exp(-dt * 5.5);
        let moving = dragging;
        for (const key of Object.keys(S) as (keyof typeof S)[]) {
          if (key === "yaw" && dragging) continue;
          if (!near(S[key], target[key])) { S[key] += (target[key] - S[key]) * k; moving = true; } else S[key] = target[key];
        }
        // камера дальше на узком экране, чтобы машина влезала
        const aspect = W / H;
        const narrow = aspect < 1.4;
        const far = narrow ? 1.12 * Math.pow(1.7 / aspect, 0.55) : 1.28 * (aspect < 1.7 ? Math.pow(1.7 / aspect, 0.85) : 1);
        if (cam.p.distanceTo(camT.p) > 0.002 || cam.l.distanceTo(camT.l) > 0.002) { cam.p.lerp(camT.p, k); cam.l.lerp(camT.l, k); moving = true; }

        hood.rotation.z = S.hood;
        trunk.rotation.z = -S.trunk;
        toolbox.position.y = 0.75 + S.box * 0.45;
        toolbox.rotation.y = S.box * 0.5;
        lift.position.y = S.lift * 0.85;
        yaw.rotation.y = S.yaw;
        liftRig.visible = S.lift > 0.01;
        const lh = S.lift * 0.85 + 0.4; // высота площадки (под днищем)
        platform.position.y = lh;
        const ang = Math.asin(Math.min(0.95, (lh - 0.06) / BAR));
        for (const b of bars) { b.position.y = (lh + 0.06) / 2; b.rotation.z = ang * b.userData.d; }
        for (const w of wheels) {
          const drop = S.lift * 0.22;
          w.g.position.y = 0.42 - drop;
          const top = 0.62 + drop; // до кузова
          w.coil.position.y = 0.05; w.coil.scale.y = top - 0.05;
          w.shock.position.y = top / 2 + 0.03; w.shock.scale.y = top;
          w.coil.visible = w.shock.visible = S.lift > 0.02;
          const front = w.x > 0 && w.z > 0;
          w.g.position.z = w.z + (front ? S.wheel * 0.55 : 0);
          (w.disc.material as T.MeshStandardMaterial).emissiveIntensity = S.wheel * 1.6;
        }
        if (target.wheel > 0 && !still) { spinA -= dt * 6; moving = true; }
        wheels[0].spin.rotation.z = spinA * S.wheel;
        if (target.glow > 0 && !still) { pulse += dt; moving = true; }
        M.glow.emissiveIntensity = 0.2 + S.glow * (1.2 + Math.sin(pulse * 4) * 0.6);

        // на узком экране смотрим ближе к центру машины, чтобы она не уезжала в угол
        const look = narrow ? cam.l.clone().multiply(new THREE.Vector3(0.45, 1, 0.45)) : cam.l;
        const dir = cam.p.clone().sub(cam.l);
        camera.position.copy(look).add(dir.multiplyScalar(far));
        camera.lookAt(look);
        renderer.render(scene, camera);

        // подписи-точки поверх канваса
        zones.forEach((z, i) => {
          const b = pins.current[i]; const a = ANCHORS[z.id];
          if (!b || !a) return;
          v.set(...a);
          if (z.id === "wheels") v.z += S.wheel * 0.55;
          car.localToWorld(v);
          v.project(camera);
          b.style.transform = `translate(${(v.x * 0.5 + 0.5) * W}px, ${(-v.y * 0.5 + 0.5) * H}px)`;
          b.style.opacity = v.z < 1 ? "1" : "0";
        });

        if (moving) raf = requestAnimationFrame(frame);
      }

      // ---------- поворот пальцем и выбор детали ----------
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let downX = 0, downY = 0, startYaw = 0, moved = false, pid = -1;
      const hit = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        for (const h of ray.intersectObject(yaw, true)) { let o: T.Object3D | null = h.object; while (o && !o.userData.zone) o = o.parent; if (o) return o.userData.zone as string; }
        return null;
      };
      const down = (e: PointerEvent) => { pid = e.pointerId; downX = e.clientX; downY = e.clientY; startYaw = S.yaw; moved = false; };
      const move = (e: PointerEvent) => {
        if (pid !== e.pointerId) {
          if (e.pointerType === "mouse") canvas.style.cursor = hit(e) ? "pointer" : "grab";
          return;
        }
        const dx = e.clientX - downX, dy = e.clientY - downY;
        if (!moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { moved = true; dragging = true; canvas.setPointerCapture(e.pointerId); }
        if (moved) { S.yaw = target.yaw = startYaw + dx * 0.008; invalidate(); }
      };
      const up = (e: PointerEvent) => {
        if (pid !== e.pointerId) return;
        pid = -1;
        if (moved) { dragging = false; invalidate(); return; }
        const z = hit(e);
        if (z) pickRef.current(z);
      };
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", () => { pid = -1; dragging = false; });

      select(curRef.current);
      api.current = { select };
      resize();

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        api.current = null;
        geos.forEach((g) => g.dispose());
        Object.values(M).forEach((m) => m.dispose());
        logoTex.dispose(); shTex.dispose(); logoMat.dispose();
        scene.environment?.dispose(); pmrem.dispose();
        renderer.dispose();
        canvas.remove();
      };
    };

    // грузим three.js, только когда блок рядом с экраном
    const io = new IntersectionObserver((es) => {
      if (es.some((x) => x.isIntersecting)) { io.disconnect(); start(); }
    }, { rootMargin: "400px" });
    io.observe(el);

    return () => { dead = true; io.disconnect(); dispose?.(); };
  }, [zones]);

  return (
    <div className={`c3 ${state}`} ref={box}>
      {state !== "ready" && <div className="c3-fallback">{children}</div>}
      {state === "ready" && zones.map((x, i) => (
        <button
          key={x.id}
          ref={(b) => { pins.current[i] = b; }}
          type="button"
          className={`xr-pin c3-pin up${x.id === cur ? " on" : ""}`}
          aria-pressed={x.id === cur}
          aria-label={x.label}
          onClick={() => onPick(x.id)}
        >
          <i aria-hidden="true">{i + 1}</i>
          <span aria-hidden="true">{x.label}</span>
        </button>
      ))}
      {state === "ready" && <p className="c3-hint" aria-hidden="true">Крутите машинку · нажмите на деталь</p>}
    </div>
  );
}
