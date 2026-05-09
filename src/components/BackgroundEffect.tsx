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

      #define PI 3.141592654

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5 * noise(p); p *= 2.02;
        f += 0.25 * noise(p); p *= 2.03;
        f += 0.125 * noise(p); p *= 2.01;
        f += 0.0625 * noise(p);
        return f / 0.9375;
      }

      float waveHeight(vec2 p, float t) {
        float h = 0.0;
        h += sin(p.x * 3.0 + t * 0.7) * 0.15;
        h += sin(p.x * 5.2 - t * 1.3) * 0.08;
        h += sin(p.x * 7.8 + t * 0.9) * 0.04;
        h += sin(p.y * 2.5 + t * 0.5) * 0.06;
        h += sin(p.x * 12.0 + p.y * 8.0 + t * 1.2) * 0.03;
        h += fbm(p * 2.0 + vec2(t * 0.2, 0.0)) * 0.2;
        return h;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        float aspect = uResolution.x / uResolution.y;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= aspect;

        float t = uTime * 0.4;

        // Sun direction - from upper right
        vec3 sunDir = normalize(vec3(0.6, 0.8, 0.2));
        vec3 sunCol = vec3(1.0, 0.95, 0.8);

        // Sky - bright daytime
        float skyY = uv.y;
        vec3 skyTop = vec3(0.3, 0.55, 0.85);
        vec3 skyBot = vec3(0.6, 0.75, 0.9);
        vec3 sky = mix(skyBot, skyTop, smoothstep(0.0, 0.6, skyY));

        // Sun glow in sky
        vec2 sunPos = vec2(0.35, 0.65);
        float sunDist = length(uv - sunPos);
        float sunGlow = exp(-sunDist * sunDist * 6.0);
        sky += sunCol * sunGlow * 0.5;
        sky += vec3(1.0, 0.9, 0.7) * pow(max(1.0 - sunDist * 3.0, 0.0), 8.0) * 0.3;

        // Wave height for horizon
        float waveH = waveHeight(p, t);
        float horizon = 0.5 + waveH * 0.25;

        // Distance from horizon (positive = below water)
        float waterDist = horizon - uv.y;

        // Water depth gradient - bright daytime ocean
        vec3 deepWater = vec3(0.0, 0.08, 0.18);
        vec3 midWater = vec3(0.02, 0.15, 0.35);
        vec3 shallowWater = vec3(0.05, 0.25, 0.5);

        vec3 waterCol = mix(shallowWater, midWater, smoothstep(0.0, 0.08, waterDist));
        waterCol = mix(waterCol, deepWater, smoothstep(0.08, 0.25, waterDist));

        // Wave normals from height differences
        float eps = 0.008;
        float h = waveHeight(p, t);
        float hx = waveHeight(p + vec2(eps, 0.0), t);
        float hy = waveHeight(p + vec2(0.0, eps), t);
        vec3 normal = normalize(vec3(h - hx, h - hy, eps));

        // Fresnel - more reflection at shallow angles
        float fresnel = pow(1.0 - smoothstep(0.3, 0.7, uv.y + waveH * 0.5), 3.0);

        // Reflection of sky on water
        vec3 reflSky = mix(skyBot, skyTop, smoothstep(0.0, 0.5, 1.0 - uv.y));
        // Sun path on water
        float sunPath = exp(-pow(uv.x - sunPos.x, 2.0) * 15.0) * exp(-(1.0 - uv.y) * 2.0);
        reflSky += sunCol * sunPath * 0.3;

        // Specular highlights - sharp sun glints
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfVec = normalize(sunDir + viewDir);
        float spec = pow(max(dot(normal, halfVec), 0.0), 256.0);
        float spec2 = pow(max(dot(normal, halfVec), 0.0), 64.0);
        float specBroad = pow(max(dot(normal, halfVec), 0.0), 16.0);

        // Combine water
        waterCol = mix(waterCol, reflSky, fresnel * 0.5);
        waterCol += sunCol * spec * 1.5;          // Sharp glints
        waterCol += sunCol * spec2 * 0.6;         // Medium glints
        waterCol += vec3(0.8, 0.85, 0.9) * specBroad * 0.3;  // Broad shimmer

        // Subsurface scattering glow
        float sss = pow(max(dot(viewDir, -sunDir), 0.0), 4.0) * smoothstep(0.0, 0.15, waterDist);
        waterCol += vec3(0.1, 0.2, 0.3) * sss * 0.5;

        // Horizon glow
        float horizonGlow = exp(-waterDist * waterDist * 300.0) * 0.4;
        waterCol += skyBot * horizonGlow;

        // Foam on crests
        float foam = smoothstep(0.45, 0.5, uv.y + waveH * 0.5) * (1.0 - smoothstep(0.5, 0.55, uv.y));
        waterCol = mix(waterCol, vec3(0.85, 0.9, 0.95), foam * 0.4);

        // Atmospheric haze/mist near horizon
        float haze = exp(-waterDist * 8.0) * 0.15;
        waterCol = mix(waterCol, sky, haze);

        // Final composition
        vec3 col = mix(waterCol, sky, smoothstep(horizon - 0.015, horizon + 0.015, uv.y));

        // Vignette
        vec2 v = uv - 0.5;
        col *= 1.0 - dot(v, v) * 0.2;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const saturnFragmentSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;

      #define PI 3.141592654
      #define TAU 6.283185307

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

      float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5 * noise(p); p *= 2.02;
        f += 0.25 * noise(p); p *= 2.03;
        f += 0.125 * noise(p); p *= 2.01;
        f += 0.0625 * noise(p);
        return f / 0.9375;
      }

      mat3 rotX(float a) {
        float s = sin(a), c = cos(a);
        return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
      }

      mat3 rotY(float a) {
        float s = sin(a), c = cos(a);
        return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
      }

      float iSphere(vec3 ro, vec3 rd, float r) {
        float b = dot(ro, rd);
        float c = dot(ro, ro) - r * r;
        float h = b * b - c;
        if (h < 0.0) return -1.0;
        return -b - sqrt(h);
      }

      vec3 sphereNormal(vec3 p) {
        return normalize(p);
      }

      float iRing(vec3 ro, vec3 rd, vec3 n, float inner, float outer) {
        float denom = dot(rd, n);
        if (abs(denom) < 0.001) return -1.0;
        float t = -dot(ro, n) / denom;
        if (t < 0.0) return -1.0;
        vec3 p = ro + rd * t;
        float r = length(p);
        if (r < inner || r > outer) return -1.0;
        return t;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        float aspect = uResolution.x / uResolution.y;
        vec2 p = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);

        // Camera
        vec3 ro = vec3(0.0, 1.0, -3.5);
        vec3 rd = normalize(vec3(p * 0.8, 1.0));

        // Light from upper-left
        vec3 sunDir = normalize(vec3(-0.6, 0.8, 0.5));
        vec3 sunCol = vec3(1.0, 0.9, 0.75);

        vec3 col = vec3(0.0);

        // Planet
        vec3 planetPos = vec3(0.0, -0.1, 0.0);
        float planetRadius = 0.55;
        vec3 localRo = ro - planetPos;

        float tPlanet = iSphere(localRo, rd, planetRadius);

        // Rings - tilted at ~20 degrees
        mat3 ringRot = rotX(0.35);
        vec3 ringNormal = ringRot * vec3(0.0, 1.0, 0.0);
        float ringInner = 0.85;
        float ringOuter = 1.5;
        float tRing = iRing(localRo, rd, ringNormal, ringInner, ringOuter);

        // Planet shadow on rings
        float ringShadow = 1.0;
        if (tRing > 0.0) {
          vec3 ringHit = localRo + rd * tRing;
          // Check if planet blocks light to this ring point
          vec3 toSun = sunDir;
          float tShadow = iSphere(ringHit - planetPos, toSun, planetRadius);
          if (tShadow > 0.0) ringShadow = 0.4;
        }

        // Ring shadow on planet
        float planetShadow = 1.0;
        if (tPlanet > 0.0) {
          vec3 planetHit = localRo + rd * tPlanet;
          vec3 toSun = sunDir;
          // Where would this point on planet be in shadow from rings?
          vec3 ringCenter = vec3(0.0);
          float ringRadius = length(ringCenter - planetHit);
          if (ringRadius > ringInner * planetRadius && ringRadius < ringOuter * planetRadius) {
            // Approximate ring shadow
            float ringAngle = atan(planetHit.z - ringCenter.z, planetHit.x - ringCenter.x);
            float shadowAngle = ringAngle + 0.3; // Offset for light angle
            vec3 shadowDir = vec3(cos(shadowAngle), 0.0, sin(shadowAngle));
            float alignment = max(dot(normalize(planetHit - ringCenter), shadowDir), 0.0);
            planetShadow = mix(1.0, 0.7, alignment * smoothstep(ringInner, ringInner + 0.2, ringRadius));
          }
        }

        // Render planet surface
        if (tPlanet > 0.0 && (tRing < 0.0 || tPlanet < tRing)) {
          vec3 pos = localRo + rd * tPlanet;
          vec3 norm = sphereNormal(pos);

          // Latitude for bands
          float lat = asin(norm.y);
          float lon = atan(norm.z, norm.x);

          // Cloud bands
          float bands = 0.0;
          bands += sin(lat * 20.0 + 0.5) * 0.4;
          bands += sin(lat * 8.0 - 0.3) * 0.3;
          bands += sin(lat * 35.0 + lon * 2.0) * 0.2;

          // Base colors - warm tan/beige
          vec3 base1 = vec3(0.88, 0.78, 0.62);
          vec3 base2 = vec3(0.75, 0.65, 0.52);
          vec3 base3 = vec3(0.92, 0.85, 0.72);
          vec3 base4 = vec3(0.82, 0.72, 0.58);

          float b1 = sin(lat * 15.0 + 0.0) * 0.5 + 0.5;
          float b2 = sin(lat * 7.0 + 1.5) * 0.5 + 0.5;
          vec3 surfCol = mix(base1, base2, b1);
          surfCol = mix(surfCol, base3, b2 * 0.5);
          surfCol += bands * 0.08;

          // Polar hazes
          float polar = smoothstep(0.55, 0.85, abs(norm.y));
          surfCol = mix(surfCol, vec3(0.95, 0.9, 0.82), polar * 0.4);

          // Lighting
          float diff = max(dot(norm, sunDir), 0.0);
          float ambient = 0.12;

          // Limb darkening
          float viewDot = max(dot(norm, -rd), 0.0);
          float limb = pow(viewDot, 0.8);

          // Specular
          vec3 halfVec = normalize(sunDir - rd);
          float spec = pow(max(dot(norm, halfVec), 0.0), 48.0) * 0.4;

          // Ring shadow on planet
          surfCol *= mix(1.0, planetShadow, 0.5);

          col = surfCol * (ambient + diff * 0.88) * limb;
          col += sunCol * spec;
        }

        // Render rings (only if in front of planet or no planet hit)
        if (tRing > 0.0 && (tPlanet < 0.0 || tRing < tPlanet)) {
          vec3 pos = localRo + rd * tRing;
          float r = length(pos);
          float angle = atan(pos.z, pos.x);

          // Ring structure
          float rNorm = (r - ringInner) / (ringOuter - ringInner);

          // Multiple ring bands
          float ringBands = 0.0;
          ringBands += sin(rNorm * 120.0) * 0.3 + 0.7;
          ringBands *= sin(rNorm * 60.0 + 1.5) * 0.2 + 0.8;
          ringBands *= sin(rNorm * 30.0 - 2.0) * 0.15 + 0.85;

          // Cassini division
          float cassini = smoothstep(0.0, 0.03, abs(rNorm - 0.48));
          ringBands *= cassini;

          // Noise texture
          float tex = fbm(vec2(angle * 20.0, rNorm * 50.0 + uTime * 0.2)) * 0.3 + 0.7;

          // Color gradient
          vec3 innerCol = vec3(0.98, 0.92, 0.78);
          vec3 midCol = vec3(0.92, 0.85, 0.7);
          vec3 outerCol = vec3(0.78, 0.7, 0.58);
          vec3 ringCol = rNorm < 0.5 ? mix(innerCol, midCol, rNorm * 2.0)
                                     : mix(midCol, outerCol, (rNorm - 0.5) * 2.0);

          // Ring normal for shading (slight curve)
          vec3 ringNorm = normalize(cross(vec3(-pos.z, 0.0, pos.x), vec3(0.0, 1.0, 0.0)));
          float ringShade = max(dot(ringNorm, sunDir), 0.0);
          ringShade = 0.4 + 0.6 * ringShade;

          // Inner edge glow
          float innerGlow = exp(-(rNorm) * 30.0) * 0.3;

          col = ringCol * ringBands * tex * ringShade * ringShadow;
          col += sunCol * innerGlow * 0.5;
        }

        // Background - dark space with subtle stars
        col += vec3(0.02, 0.02, 0.04) * (0.5 + 0.5 * noise(p * 50.0));

        // Subtle atmospheric glow around planet
        float atmoGlow = pow(1.0 - abs(p.y), 8.0) * 0.08;
        col += sunCol * atmoGlow;

        // Tone mapping
        col = pow(col, vec3(0.4545));
        col = clamp(col, 0.0, 1.0);

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