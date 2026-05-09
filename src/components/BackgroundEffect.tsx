"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BackgroundEffect.module.css";

type EffectType = "rain" | "stars" | "seascape" | "saturn";

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [effect, setEffect] = useState<EffectType>("rain");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    const vertexSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const rainSceneFragmentSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uIntensity;

      #define S(a, b, t) smoothstep(a, b, t)
      vec3 N13(float p) {
        vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787));
        p3 += dot(p3, p3.yzx + 19.19);
        return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
      }
      float N(float t) { return fract(sin(t*12345.564)*7658.76); }
      float Saw(float b, float t) { return S(0., b, t)*S(1., b, t); }
      vec2 DropLayer2(vec2 uv, float t) {
        vec2 UV = uv;
        uv.y += t*.75;
        vec2 a = vec2(6., 1.);
        vec2 grid = a*2.;
        vec2 id = floor(uv*grid);
        float colShift = N(id.x);
        uv.y += colShift;
        id = floor(uv*grid);
        vec3 n = N13(id.x*35.2+id.y*2376.1);
        vec2 st = fract(uv*grid)-vec2(.5, 0);
        float x = n.x-.5;
        float y = UV.y*20.;
        float wiggle = sin(y+sin(y));
        x += wiggle*(.5-abs(x))*(n.z-.5);
        x *= .7;
        float ti = fract(t+n.z);
        y = (Saw(.85, ti)-.5)*.9+.5;
        vec2 p = vec2(x, y);
        float d = length((st-p)*a.yx);
        float mainDrop = S(.4, .0, d);
        float r = sqrt(S(1., y, st.y));
        float cd = abs(st.x-x);
        float trail = S(.23*r, .15*r*r, cd);
        float trailFront = S(-.02, .02, st.y-y);
        trail *= trailFront*r*r;
        y = UV.y;
        float trail2 = S(.2*r, .0, cd);
        float droplets = max(0., (sin(y*(1.-y)*120.)-st.y))*trail2*trailFront*n.z;
        y = fract(y*10.)+(st.y-.5);
        float dd = length(st-vec2(x, y));
        droplets = S(.3, 0., dd);
        float m = mainDrop+droplets*r*trailFront;
        return vec2(m, trail);
      }
      float StaticDrops(vec2 uv, float t) {
        uv *= 40.;
        vec2 id = floor(uv);
        uv = fract(uv)-.5;
        vec3 n = N13(id.x*107.45+id.y*3543.654);
        vec2 p = (n.xy-.5)*.7;
        float d = length(uv-p);
        float fade = Saw(.025, fract(t+n.z));
        float c = S(.3, 0., d)*fract(n.z*10.)*fade;
        return c;
      }
      vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
        float s = StaticDrops(uv, t)*l0;
        vec2 m1 = DropLayer2(uv, t)*l1;
        vec2 m2 = DropLayer2(uv*1.85, t)*l2;
        float c = s+m1.x+m2.x;
        c = S(.3, 1., c);
        return vec2(c, max(m1.y*l0, m2.y*l1));
      }
      vec4 rainDrops(vec2 fragCoord) {
        vec2 uv = (fragCoord.xy-.5*uResolution.xy) / uResolution.y;
        float T = uTime + 2.0;
        float t = T*.2;
        float rainAmount = clamp(.72*uIntensity, 0., 1.25);
        float staticDrops = S(-.5, 1., rainAmount)*2.;
        float layer1 = S(.25, .75, rainAmount);
        float layer2 = S(.0, .5, rainAmount);
        vec2 c = Drops(uv, t, staticDrops, layer1, layer2);
        vec2 e = vec2(.001, 0.);
        float cx = Drops(uv+e, t, staticDrops, layer1, layer2).x;
        float cy = Drops(uv+e.yx, t, staticDrops, layer1, layer2).x;
        vec2 n = vec2(cx-c.x, cy-c.x);
        return vec4(c, n);
      }
      vec3 cityScene(vec2 uv) {
        vec2 p = uv*2.-1.;
        p.x *= uResolution.x / max(uResolution.y, 1.);
        vec3 col = mix(vec3(.004, .009, .014), vec3(.016, .07, .095), S(.02, .88, uv.y));
        float amberBand = exp(-pow((uv.y-.53)*23., 2.));
        float amberCore = exp(-pow((uv.y-.53)*70., 2.));
        col += vec3(1., .34, .055)*amberBand*.95 + vec3(1., .74, .24)*amberCore*.62;
        float blueBand = exp(-pow((uv.y-.34)*8., 2.)) + exp(-pow((uv.y-.74)*8., 2.));
        col += vec3(.035, .25, .43)*blueBand*(.34+.66*sin(uv.x*42.+uTime*.12)*.5+.33);
        for (float i=0.; i<26.; i+=1.) {
          vec2 h = vec2(N(i*13.21), N(i*47.13));
          vec2 center = vec2(h.x, mix(.12, .88, h.y));
          float size = mix(.014, .055, N(i*77.7));
          vec2 q = (uv-center)/vec2(size, size*.58);
          float glow = exp(-dot(q,q));
          vec3 light = mix(vec3(.10,.55,1.), vec3(1.,.36,.08), step(.58, N(i*19.2)));
          col += light*glow*.42;
        }
        float vignette = 1.-dot(p*.58, p*.58);
        return col*clamp(vignette, .12, 1.);
      }
      vec3 blurredScene(vec2 uv, float blur) {
        vec2 radius = vec2(blur*.0017);
        vec3 col = cityScene(uv)*.28;
        col += cityScene(uv + radius*vec2(1.,0.))*.12;
        col += cityScene(uv - radius*vec2(1.,0.))*.12;
        col += cityScene(uv + radius*vec2(0.,1.))*.12;
        col += cityScene(uv - radius*vec2(0.,1.))*.12;
        col += cityScene(uv + radius*vec2(.8,.8))*.12;
        col += cityScene(uv - radius*vec2(.8,.8))*.12;
        return col;
      }
      void main() {
        vec2 UV = gl_FragCoord.xy/uResolution.xy;
        vec4 drop = rainDrops(gl_FragCoord.xy);
        vec2 c = drop.xy;
        vec2 n = drop.zw;
        float rainAmount = clamp(.72*uIntensity, 0., 1.25);
        float maxBlur = mix(3., 6., rainAmount);
        float minBlur = 2.;
        float focus = mix(maxBlur-c.y, minBlur, S(.1, .2, c.x));
        vec3 col = blurredScene(UV+n*1.85, focus);
        float t = (uTime+3.)*.5;
        float colFade = sin(t*.2)*.5+.5;
        col *= mix(vec3(1.), vec3(.8, .9, 1.3), colFade);
        float lightning = sin(t*sin(t*10.));
        lightning *= pow(max(0., sin(t+sin(t))), 10.);
        col *= 1.+lightning*.12;
        vec2 v = UV-.5;
        col *= 1.-dot(v, v);
        col += vec3(.7,.94,1.)*pow(c.x, 6.)*.08;
        gl_FragColor = vec4(col, 1.);
      }
    `;

    const starNestFragmentSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;

      #define iterations 17
      #define formuparam 0.53
      #define volsteps 20
      #define stepsize 0.1
      #define zoom 0.800
      #define tile 0.850
      #define speed 0.010
      #define brightness 0.0015
      #define darkmatter 0.300
      #define distfading 0.730
      #define saturation 0.850

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy - 0.5;
        uv.y *= uResolution.y / uResolution.x;
        vec3 dir = vec3(uv * zoom, 1.0);
        float time = uTime * speed + 0.25;

        float a1 = 0.5;
        float a2 = 0.8;
        mat2 rot1 = mat2(cos(a1), sin(a1), -sin(a1), cos(a1));
        mat2 rot2 = mat2(cos(a2), sin(a2), -sin(a2), cos(a2));
        dir.xz *= rot1;
        dir.xy *= rot2;
        vec3 from = vec3(1.0, 0.5, 0.5);
        from += vec3(time * 2.0, time, -2.0);
        from.xz *= rot1;
        from.xy *= rot2;

        float s = 0.1;
        float fade = 1.0;
        vec3 v = vec3(0.0);
        for (int r = 0; r < volsteps; r++) {
          vec3 p = from + s * dir * 0.5;
          p = abs(vec3(tile) - mod(p, vec3(tile * 2.0)));
          float pa, a = pa = 0.0;
          for (int i = 0; i < iterations; i++) {
            p = abs(p) / dot(p, p) - formuparam;
            a += abs(length(p) - pa);
            pa = length(p);
          }
          float dm = max(0.0, darkmatter - a * a * 0.001);
          a *= a * a;
          if (r > 6) fade *= 1.0 - dm;
          v += fade;
          v += vec3(s, s * s, s * s * s * s) * a * brightness * fade;
          fade *= distfading;
          s += stepsize;
        }
        v = mix(vec3(length(v)), v, saturation);
        gl_FragColor = vec4(v * 0.01, 1.0);
      }
    `;

    const seascapeFragmentSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;

      #define NUM_STEPS 8
      #define PI 3.141592
      #define FAR 100.0

      mat2 octave_m = mat2(1.6, 1.2, -1.2, 1.6);

      float hash(vec2 p) {
        p = fract(p * vec2(5.3983, 5.4427));
        p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
        return fract(p.x * p.y * 95.4337);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      float octave(vec2 uv) {
        vec2 p = uv;
        float f = 0.0;
        f += 0.5000 * noise(p); p = octave_m * p;
        f += 0.2500 * noise(p); p = octave_m * p;
        f += 0.1250 * noise(p); p = octave_m * p;
        f += 0.0625 * noise(p);
        return f / 0.9375;
      }

      float diffuse(vec3 n, vec3 l, float p) {
        return pow(dot(n, l) * 0.4 + 0.6, p);
      }

      float specular(vec3 n, vec3 l, vec3 e, float s) {
        float nrm = (s + 8.0) / (PI * 8.0);
        return pow(max(dot(reflect(e, n), l), 0.0), s) * nrm;
      }

      float sea(vec2 uv, float time) {
        float freq = 0.16;
        float amp = 0.6;
        float h = 0.0;
        for (int i = 0; i < NUM_STEPS; i++) {
          float t = time * 0.3;
          h += (sin(uv.x * freq + t) + sin(uv.y * freq + t * 0.8)) * amp;
          freq *= 1.9;
          amp *= 0.22;
          uv *= octave_m;
        }
        return h;
      }

      vec3 getSkyColor(vec3 e) {
        e.y = max(e.y, 0.0);
        return vec3(0.7, 0.8, 0.9) - e.y * 0.5;
      }

      vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, float dist) {
        float fresnel = clamp(1.0 - dot(n, -eye), 0.0, 1.0);
        fresnel = pow(fresnel, 3.0) * 0.5;
        vec3 refracted = getSkyColor(reflect(eye, n));
        vec3 seaCol = vec3(0.0, 0.06, 0.12) + diffuse(n, l, 40.0) * vec3(0.04, 0.12, 0.2);
        seaCol += specular(n, l, eye, 60.0) * vec3(0.6, 0.7, 0.8);
        seaCol = mix(seaCol, refracted, fresnel);
        float atten = max(1.0 - dist * 0.001, 0.0);
        seaCol += vec3(0.1, 0.15, 0.2) * (p.y - 0.0) * 0.3 * atten;
        return seaCol;
      }

      vec3 getNormal(vec3 p, float dist) {
        float eps = 0.1;
        vec3 n;
        n.y = sea(p.xz, uTime);
        n.x = sea(p.xz + vec2(eps, 0.0), uTime) - n.y;
        n.z = sea(p.xz + vec2(0.0, eps), uTime) - n.y;
        n.y = eps;
        return normalize(n);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= uResolution.x / uResolution.y;

        float time = uTime * 0.5;

        vec3 ang = vec3(0.0, 0.15, 0.0);
        vec3 ori = vec3(0.0, 3.5, 5.0);
        vec3 dir = normalize(vec3(uv.xy, -1.5));

        vec3 p = ori + dir * 3.0;
        float dist = 0.0;
        float speed = 0.0;

        for (int i = 0; i < 6; i++) {
          p.y += sea(p.xz, time) * 0.3;
          dist += p.y;
          speed = (p.y - dist) * 0.2;
        }

        vec3 seaNormal = getNormal(p, dist);

        vec3 lightDir = normalize(vec3(0.0, 1.0, 0.8));

        vec3 color = mix(
          getSkyColor(dir),
          getSeaColor(p, seaNormal, lightDir, dir, dist),
          pow(smoothstep(0.0, -5.0, p.y), 0.3)
        );

        color += vec3(0.9, 0.95, 1.0) * pow(max(dot(seaNormal, lightDir), 0.0), 256.0) * 0.5;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const saturnFragmentSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;

      #define PI 3.141592654
      #define TAU 6.283185307

      vec2 SaturnDef(vec2 p, float r) {
        vec2 sp = vec2(atan(p.y, p.x), length(p));
        sp.x += 0.003 * sin(sp.y * 30.0 - uTime);
        sp.x += 0.001 * sin(sp.y * 50.0 + uTime * 0.5);
        return vec2(sp.x / TAU + 0.5, sp.y - r);
      }

      vec4 ringColor(vec2 uv, vec2 uvRing, vec2 dir) {
        float r = uvRing.y;
        float brightness = 0.5 + 0.5 * sin(uvRing.x * TAU * 100.0);
        float innerRings = sin(r * 80.0) * 0.5 + 0.5;
        float outerDetail = sin(r * 200.0) * 0.3 + 0.7;
        vec3 ringCol = vec3(0.85, 0.75, 0.6) * brightness * innerRings * outerDetail;
        float tilt = 0.004 / r;
        float angle = atan(uv.y - 0.5, uv.x - 0.5);
        ringCol *= 1.0 + 0.3 * sin(angle * 3.0 + r * 50.0);
        return vec4(ringCol, smoothstep(-0.1, 0.0, -abs(uvRing.y)));
      }

      void main() {
        vec2 q = gl_FragCoord.xy / uResolution.xy;
        vec2 p = -1.0 + 2.0 * q;
        p.x *= uResolution.x / uResolution.y;

        vec3 col = vec3(0.0);

        // Planet
        vec2 pPlanet = p - vec2(0.0, 0.05);
        float rPlanet = 0.35;
        float dPlanet = length(pPlanet) - rPlanet;

        // Rings
        vec2 pRing = p - vec2(0.0, 0.0);
        vec2 ringUV = SaturnDef(pRing, 0.5);
        float ringInner = 0.45;
        float ringOuter = 0.8;
        float dRing = 0.0;

        // Ring gap
        float cassini = 1.0 - smoothstep(0.0, 0.01, abs(ringUV.y - 0.01));

        // Ring front/back
        float ringFront = smoothstep(-0.02, 0.02, pRing.y);

        // Planet surface
        if (dPlanet < 0.0) {
          vec2 uvSphere = pPlanet / rPlanet;
          float lat = asin(uvSphere.y);
          float lon = atan(uvSphere.z, uvSphere.x);
          vec3 surfCol = vec3(0.0);

          // Banded atmosphere
          float bands = sin(lat * 30.0 + uTime * 0.1) * 0.5 + 0.5;
          surfCol = mix(vec3(0.55, 0.45, 0.35), vec3(0.75, 0.65, 0.55), bands);

          // Polar regions
          float polar = smoothstep(0.6, 0.9, abs(uvSphere.y));
          surfCol = mix(surfCol, vec3(0.8, 0.75, 0.7), polar * 0.5);

          // Limb darkening
          float limb = 1.0 - smoothstep(0.7, 1.0, length(uvSphere.xy));
          surfCol *= 0.7 + 0.3 * limb;

          col = surfCol;
        }

        // Rings in front
        if (ringFront > 0.5) {
          float ringR = length(pRing);
          if (ringR > ringInner && ringR < ringOuter) {
            vec4 rc = ringColor(q, SaturnDef(pRing, 0.6), normalize(pRing));
            col = mix(col, rc.rgb, rc.a * (1.0 - smoothstep(ringInner, ringInner + 0.02, ringR)));
          }
        }

        // Rings behind
        if (ringFront < 0.5) {
          float ringR = length(pRing);
          if (ringR > ringInner && ringR < ringOuter) {
            vec4 rc = ringColor(q, SaturnDef(pRing, 0.6), normalize(pRing));
            float ringAlpha = rc.a * cassini * 0.6;
            col = mix(col, rc.rgb * 0.8, ringAlpha);
          }
        }

        // Subtle glow
        float glow = exp(-length(p - vec2(0.0, 0.05)) * 2.0) * 0.15;
        col += vec3(0.9, 0.7, 0.5) * glow;

        col = sqrt(col);
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    let program: WebGLProgram | null = null;
    let start = performance.now();
    let rainIntensity = 1.08;

    function compileShader(glContext: WebGLRenderingContext, type: number, source: string) {
      const shader = glContext.createShader(type);
      if (!shader) return null;
      glContext.shaderSource(shader, source);
      glContext.compileShader(shader);
      if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        console.error("Shader compile error:", glContext.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    function createProgram(glContext: WebGLRenderingContext, fragmentSource: string) {
      const vertex = compileShader(glContext, glContext.VERTEX_SHADER, vertexSource);
      const fragment = compileShader(glContext, glContext.FRAGMENT_SHADER, fragmentSource);
      if (!vertex || !fragment) return null;
      const prog = glContext.createProgram();
      if (!prog) return null;
      glContext.attachShader(prog, vertex);
      glContext.attachShader(prog, fragment);
      glContext.linkProgram(prog);
      if (!glContext.getProgramParameter(prog, glContext.LINK_STATUS)) {
        console.error("Program link error:", glContext.getProgramInfoLog(prog));
        return null;
      }
      glContext.useProgram(prog);
      const buffer = glContext.createBuffer();
      glContext.bindBuffer(glContext.ARRAY_BUFFER, buffer);
      glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), glContext.STATIC_DRAW);
      const position = glContext.getAttribLocation(prog, "aPosition");
      glContext.enableVertexAttribArray(position);
      glContext.vertexAttribPointer(position, 2, glContext.FLOAT, false, 0, 0);
      return prog;
    }

    function resize() {
      const c = canvas;
      if (!c || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, c.width, c.height);
    }

    function getFragmentSource(): string {
      switch (effect) {
        case "rain": return rainSceneFragmentSource;
        case "stars": return starNestFragmentSource;
        case "seascape": return seascapeFragmentSource;
        case "saturn": return saturnFragmentSource;
      }
    }

    function render(now: number) {
      if (!gl || !canvas) return;

      if (program) {
        gl.deleteProgram(program);
        program = null;
      }

      const fragmentSource = getFragmentSource();
      program = createProgram(gl, fragmentSource);

      if (!program) {
        requestAnimationFrame(render);
        return;
      }

      resize();
      gl.useProgram(program);
      gl.uniform2f(gl.getUniformLocation(program, "uResolution"), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, "uTime"), (now - start) / 1000);

      if (effect === "rain") {
        gl.uniform1f(gl.getUniformLocation(program, "uIntensity"), rainIntensity);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }

    resize();
    requestAnimationFrame(render);

    window.addEventListener("resize", resize);

    return () => {
      if (program) gl.deleteProgram(program);
    };
  }, [effect]);

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.grain} />
      <button
        className={styles.toggleBtn}
        onClick={() => setEffect(e => e === "rain" ? "stars" : e === "stars" ? "seascape" : e === "seascape" ? "saturn" : "rain")}
      >
        {effect === "rain" ? "Stars" : effect === "stars" ? "Seascape" : effect === "seascape" ? "Saturn" : "Rain"}
      </button>
    </>
  );
}