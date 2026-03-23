'use client';

import React, { useRef, useEffect, useState } from 'react';

/** Default avatar: public/model.glb (GLB) or public/avatar.vrm (VRM). Supports both formats. */
const DEFAULT_MODEL_URL = '/model.glb';
/** Optional room/office background: public/avatar-bg.jpg or .png. If missing, a procedural bookshelf is used. */
const ROOM_BG_URLS = ['/avatar-bg.jpg', '/avatar-bg.png'];

/**
 * Renders a 3D avatar (GLB/GLTF or VRM) in a Three.js scene.
 * Supports simple real-time interview animation:
 * - speaking mouth movement (aa/ih/ou style)
 * - periodic blinking
 * - subtle head/neck idle motion
 */
export default function InterviewAvatarVrm({ className = '', modelUrl = DEFAULT_MODEL_URL, isSpeaking = false }) {
    const containerRef = useRef(null);
    const sceneRef = useRef({
        renderer: null,
        scene: null,
        camera: null,
        frameId: null,
        resize: null,
        model: null,
        vrm: null,
        isVrm: false,
        mouth: 0,
        mouthTarget: 0,
        viseme: 'aa',
        nextVisemeAt: 0,
        blink: 0,
        blinkDir: 1,
        nextBlinkAt: 0,
        idleClock: 0,
        headNode: null,
        neckNode: null,
        jawNode: null,
        headBaseRot: null,
        neckBaseRot: null,
        jawBaseRot: null,
        morphTargets: {
            aa: [],
            ih: [],
            ou: [],
            blink: []
        }
    });
    const speakingRef = useRef(!!isSpeaking);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        speakingRef.current = !!isSpeaking;
    }, [isSpeaking]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let mounted = true;
        const refs = sceneRef.current;

        (async () => {
            try {
                const [THREE, { GLTFLoader }] = await Promise.all([
                    import('three'),
                    import('three/examples/jsm/loaders/GLTFLoader.js')
                ]);
                const isVrm = /\.vrm$/i.test(modelUrl);
                if (isVrm) {
                    await import('@pixiv/three-vrm');
                }
                if (!mounted) return;

                const width = container.clientWidth;
                const height = container.clientHeight;

                const scene = new THREE.Scene();
                scene.background = new THREE.Color(0x2c1810);

                function makeBookshelfTexture() {
                    const c = document.createElement('canvas');
                    c.width = 1024;
                    c.height = 1024;
                    const ctx = c.getContext('2d');
                    ctx.fillStyle = '#3d2914';
                    ctx.fillRect(0, 0, 1024, 1024);
                    const shelfH = 140;
                    const bookColors = ['#4a3728', '#5c4033', '#6b4423', '#2d5016', '#1a3a52', '#4a2c2a', '#8b6914', '#3d2c1e', '#2c1810', '#5a4a3a'];
                    for (let y = 0; y < 1024; y += shelfH) {
                        ctx.fillStyle = '#5c4033';
                        ctx.fillRect(0, y, 1024, 12);
                        ctx.fillStyle = '#8b7355';
                        ctx.fillRect(0, y + 12, 1024, 4);
                        let x = 0;
                        while (x < 1024) {
                            const w = 24 + Math.random() * 80;
                            ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
                            ctx.fillRect(x, y + 16, w, shelfH - 24);
                            ctx.fillStyle = 'rgba(0,0,0,0.15)';
                            ctx.fillRect(x, y + 16, w * 0.15, shelfH - 24);
                            x += w + 2;
                        }
                    }
                    return new THREE.CanvasTexture(c);
                }

                const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
                camera.position.set(0, 0.02, 0.68);
                camera.lookAt(0, 0, 0);

                const ambient = new THREE.AmbientLight(0xffffff, 0.6);
                scene.add(ambient);
                const dir = new THREE.DirectionalLight(0xffffff, 0.8);
                dir.position.set(2, 4, 3);
                scene.add(dir);

                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
                renderer.setSize(width, height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.outputColorSpace = THREE.SRGBColorSpace;
                container.appendChild(renderer.domElement);

                refs.renderer = renderer;
                refs.scene = scene;
                refs.camera = camera;

                function addRoomBackground(texture) {
                    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
                    const geom = new THREE.PlaneGeometry(4, 4);
                    const mat = new THREE.MeshBasicMaterial({
                        map: texture,
                        depthWrite: true,
                        side: THREE.FrontSide
                    });
                    const mesh = new THREE.Mesh(geom, mat);
                    mesh.position.z = -0.95;
                    scene.add(mesh);
                    refs.bgTexture = texture;
                    refs.bgMesh = mesh;
                }

                const texLoader = new THREE.TextureLoader();
                function tryNextRoomUrl(index) {
                    if (index >= ROOM_BG_URLS.length) {
                        const procTex = makeBookshelfTexture();
                        procTex.colorSpace = THREE.SRGBColorSpace;
                        addRoomBackground(procTex);
                        return;
                    }
                    texLoader.load(
                        ROOM_BG_URLS[index],
                        (tex) => {
                            if (!mounted) return;
                            tex.colorSpace = THREE.SRGBColorSpace;
                            addRoomBackground(tex);
                        },
                        undefined,
                        () => { tryNextRoomUrl(index + 1); }
                    );
                }
                tryNextRoomUrl(0);

                const loader = new GLTFLoader();
                if (isVrm) {
                    const { VRMLoaderPlugin } = await import('@pixiv/three-vrm');
                    loader.register((parser) => new VRMLoaderPlugin(parser));
                }

                function addModelToScene(model, vrm) {
                    if (!model || !mounted) return;
                    model.position.set(0, 0, 0);
                    model.rotation.set(0, 0, 0);
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    model.position.sub(center);
                    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
                    const scale = 1.2 / maxDim;
                    model.scale.setScalar(scale);
                    box.setFromObject(model);
                    const sizeAfter = box.getSize(new THREE.Vector3());
                    const faceY = sizeAfter.y * 0.12;
                    model.position.y -= faceY;
                    scene.add(model);
                    refs.model = model;
                    refs.vrm = vrm || null;
                    refs.isVrm = !!vrm;

                    // VRM bones for subtle idle head movement.
                    if (vrm?.humanoid) {
                        refs.headNode =
                            vrm.humanoid.getRawBoneNode?.('head') ||
                            vrm.humanoid.getNormalizedBoneNode?.('head') ||
                            null;
                        refs.neckNode =
                            vrm.humanoid.getRawBoneNode?.('neck') ||
                            vrm.humanoid.getNormalizedBoneNode?.('neck') ||
                            null;
                        refs.jawNode =
                            vrm.humanoid.getRawBoneNode?.('jaw') ||
                            vrm.humanoid.getNormalizedBoneNode?.('jaw') ||
                            null;
                        if (refs.headNode) refs.headBaseRot = refs.headNode.rotation.clone();
                        if (refs.neckNode) refs.neckBaseRot = refs.neckNode.rotation.clone();
                        if (refs.jawNode) refs.jawBaseRot = refs.jawNode.rotation.clone();
                    }

                    // GLB morph target fallback (when not VRM expression manager).
                    const lower = (s) => String(s || '').toLowerCase();
                    model.traverse((obj) => {
                        if (!obj?.isMesh || !obj.morphTargetDictionary || !obj.morphTargetInfluences) return;
                        const dict = obj.morphTargetDictionary;
                        Object.keys(dict).forEach((k) => {
                            const lk = lower(k);
                            const index = dict[k];
                            const push = (arr) => arr.push({ mesh: obj, index });
                            if (/blink|eye.?close|close.?eye/.test(lk)) push(refs.morphTargets.blink);
                            if (/aa|viseme_?aa|mouth_?open|jawopen/.test(lk)) push(refs.morphTargets.aa);
                            if (/ih|ee|viseme_?ih|mouth_?smile/.test(lk)) push(refs.morphTargets.ih);
                            if (/ou|oh|oo|viseme_?ou/.test(lk)) push(refs.morphTargets.ou);
                        });

                        // Bone-name fallback for non-VRM GLB rigs.
                        if (obj?.isBone) {
                            const n = lower(obj.name);
                            if (!refs.headNode && /\bhead\b/.test(n)) {
                                refs.headNode = obj;
                                refs.headBaseRot = obj.rotation.clone();
                            } else if (!refs.neckNode && /\bneck\b/.test(n)) {
                                refs.neckNode = obj;
                                refs.neckBaseRot = obj.rotation.clone();
                            } else if (!refs.jawNode && /\bjaw\b|mandible|chin/.test(n)) {
                                refs.jawNode = obj;
                                refs.jawBaseRot = obj.rotation.clone();
                            }
                        }
                    });
                }

                function clamp01(v) {
                    return Math.max(0, Math.min(1, v));
                }

                function setVrmExpression(vrm, key, value) {
                    if (!vrm) return;
                    const v = clamp01(value);
                    if (vrm.expressionManager?.setValue) {
                        vrm.expressionManager.setValue(key, v);
                        return;
                    }
                    // Backward compatibility with older three-vrm.
                    if (vrm.blendShapeProxy?.setValue && vrm.blendShapeProxy?.BlendShapePresetName) {
                        const presets = vrm.blendShapeProxy.BlendShapePresetName;
                        const mapped = presets[String(key).toUpperCase()] || presets[key] || key;
                        vrm.blendShapeProxy.setValue(mapped, v);
                    }
                }

                function setMorphTargets(targets, value) {
                    const v = clamp01(value);
                    targets.forEach(({ mesh, index }) => {
                        if (!mesh?.morphTargetInfluences || mesh.morphTargetInfluences[index] == null) return;
                        mesh.morphTargetInfluences[index] = v;
                    });
                }

                function applySpeakingViseme(viseme, amount) {
                    const a = clamp01(amount);
                    if (refs.vrm) {
                        setVrmExpression(refs.vrm, 'aa', viseme === 'aa' ? a : 0);
                        setVrmExpression(refs.vrm, 'ih', viseme === 'ih' ? a : 0);
                        setVrmExpression(refs.vrm, 'ou', viseme === 'ou' ? a : 0);
                    }
                    setMorphTargets(refs.morphTargets.aa, viseme === 'aa' ? a : 0);
                    setMorphTargets(refs.morphTargets.ih, viseme === 'ih' ? a : 0);
                    setMorphTargets(refs.morphTargets.ou, viseme === 'ou' ? a : 0);
                    // Bone fallback: jaw open/close for rigs without blendshapes.
                    if (refs.jawNode && refs.jawBaseRot) {
                        refs.jawNode.rotation.x = refs.jawBaseRot.x + a * 0.22;
                    }
                }

                function applyBlink(amount) {
                    const a = clamp01(amount);
                    if (refs.vrm) setVrmExpression(refs.vrm, 'blink', a);
                    setMorphTargets(refs.morphTargets.blink, a);
                }

                loader.load(
                    modelUrl,
                    (gltf) => {
                        if (!mounted) return;
                        const vrm = isVrm ? gltf.userData.vrm : null;
                        const model = vrm?.scene || gltf.scene;
                        addModelToScene(model, vrm);
                        setLoading(false);
                    },
                    undefined,
                    (err) => {
                        if (mounted) {
                            setError(err?.message || 'Failed to load avatar');
                            setLoading(false);
                        }
                    }
                );

                function animate() {
                    if (!mounted) return;
                    refs.frameId = requestAnimationFrame(animate);
                    const now = performance.now();
                    refs.idleClock += 1 / 60;

                    // Speaking mouth movement: pseudo-viseme cycling for real-time feel.
                    if (speakingRef.current) {
                        if (now >= refs.nextVisemeAt) {
                            const pool = ['aa', 'ih', 'ou'];
                            refs.viseme = pool[Math.floor(Math.random() * pool.length)];
                            refs.mouthTarget = 0.42 + Math.random() * 0.36;
                            refs.nextVisemeAt = now + 90 + Math.random() * 130;
                        }
                    } else {
                        refs.mouthTarget = 0;
                    }
                    refs.mouth += (refs.mouthTarget - refs.mouth) * 0.22;
                    applySpeakingViseme(refs.viseme, refs.mouth);

                    // Blink loop.
                    if (refs.nextBlinkAt === 0) refs.nextBlinkAt = now + 1200 + Math.random() * 2200;
                    if (now >= refs.nextBlinkAt && refs.blinkDir > 0) refs.blinkDir = -1;
                    refs.blink += refs.blinkDir * 0.13;
                    if (refs.blink <= 0) {
                        refs.blink = 0;
                        refs.blinkDir = 1;
                        refs.nextBlinkAt = now + 1200 + Math.random() * 2200;
                    } else if (refs.blink >= 1) {
                        refs.blink = 1;
                        refs.blinkDir = 1;
                    }
                    applyBlink(refs.blink);

                    // Subtle interview-style head/neck idle + tiny speaking nod.
                    const t = refs.idleClock;
                    const speakingNod = speakingRef.current ? Math.sin(t * 8.5) * 0.02 : 0;
                    if (refs.headNode && refs.headBaseRot) {
                        refs.headNode.rotation.x = refs.headBaseRot.x + Math.sin(t * 0.9) * 0.04 + speakingNod;
                        refs.headNode.rotation.y = refs.headBaseRot.y + Math.sin(t * 0.55) * 0.05;
                        refs.headNode.rotation.z = refs.headBaseRot.z + Math.sin(t * 0.8) * 0.02;
                    }
                    if (refs.neckNode && refs.neckBaseRot) {
                        refs.neckNode.rotation.x = refs.neckBaseRot.x + Math.sin(t * 0.7) * 0.02;
                        refs.neckNode.rotation.y = refs.neckBaseRot.y + Math.sin(t * 0.45) * 0.025;
                    }
                    // Last-resort fallback: move whole model very slightly if no head/neck detected.
                    if (!refs.headNode && !refs.neckNode && refs.model) {
                        refs.model.rotation.y = Math.sin(t * 0.45) * 0.03;
                        refs.model.rotation.x = Math.sin(t * 0.8) * 0.01;
                    }

                    if (refs.vrm?.update) refs.vrm.update(1 / 60);
                    renderer.render(scene, camera);
                }
                animate();

                const onResize = () => {
                    if (!container?.parentElement || !refs.camera || !refs.renderer) return;
                    const w = container.clientWidth;
                    const h = container.clientHeight;
                    refs.camera.aspect = w / h;
                    refs.camera.updateProjectionMatrix();
                    refs.renderer.setSize(w, h);
                };
                window.addEventListener('resize', onResize);
                refs.resize = onResize;
            } catch (e) {
                if (mounted) {
                    setError(e?.message || 'Failed to init 3D');
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
            const r = sceneRef.current;
            if (r.frameId) cancelAnimationFrame(r.frameId);
            if (r.resize) window.removeEventListener('resize', r.resize);
            if (r.renderer?.domElement?.parentNode) r.renderer.domElement.parentNode.removeChild(r.renderer.domElement);
            r.renderer?.dispose();
            r.renderer = null;
            r.scene = null;
            r.camera = null;
            r.frameId = null;
            r.resize = null;
            if (r.bgMesh?.parent) {
                r.bgMesh.parent.remove(r.bgMesh);
                r.bgMesh.geometry?.dispose();
                r.bgMesh.material?.dispose();
                if (r.bgMesh.material?.map) r.bgMesh.material.map.dispose();
            }
            r.bgMesh = null;
            r.bgTexture = null;
        };
    }, [modelUrl]);

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center gap-2 text-gray-500 p-4 text-center ${className}`}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-600/30 flex items-center justify-center" />
                <span className="text-xs font-medium">Avatar unavailable</span>
                <span className="text-[10px] max-w-[180px]">Add <code className="bg-black/20 px-1 rounded">public/model.glb</code> or <code className="bg-black/20 px-1 rounded">public/avatar.vrm</code> — see public/AVATAR_README.md</span>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full min-h-[200px] ${className}`}>
            <div ref={containerRef} className="absolute inset-0 w-full h-full" />
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-800/50 text-gray-400">
                    <div className="w-8 h-8 border-2 border-emerald-500/50 border-t-emerald-400 rounded-full animate-spin" />
                    <span className="text-xs">Loading avatar...</span>
                </div>
            )}
        </div>
    );
}
