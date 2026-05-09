"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BackgroundEffect.module.css";

type EffectType = "rain" | "stars" | "seascape" | "saturn";

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [effect, setEffect] = useState<EffectType>("rain");

  useEffect(() => {
    document.documentElement.dataset.effect = effect;

    return () => {
      delete document.documentElement.dataset.effect;
    };
  }, [effect]);

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

      mat2 m2 = mat2(1.6, 1.2, -1.2, 1.6);

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = i.x + i.y * 57.0;
        return mix(
          mix(hash(n), hash(n + 1.0), f.x),
          mix(hash(n + 57.0), hash(n + 58.0), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5000 * noise(p); p = m2 * p;
        f += 0.2500 * noise(p); p = m2 * p;
        f += 0.1250 * noise(p); p = m2 * p;
        f += 0.0625 * noise(p);
        return f / 0.9375;
      }

      // Sea octave - smooth noise-based wave
      float sea_octave(vec2 uv, float choppy) {
        uv += noise(uv);
        vec2 wv = 1.0 - abs(sin(uv));
        vec2 swv = abs(cos(uv));
        wv = mix(wv, swv, wv);
        return pow(1.0 - pow(wv.x * wv.y, 0.65), choppy);
      }

      float sea(vec2 p, float t) {
        float freq = 0.16;
        float amp = 0.6;
        float choppy = 4.0;
        vec2 uv = p;
        float d = 0.0;
        float h = 0.0;
        for (int i = 0; i < 5; i++) {
          d = sea_octave((uv + t) * freq, choppy);
          d += sea_octave((uv - t) * freq, choppy);
          h += d * amp;
          uv *= m2;
          freq *= 1.9;
          amp *= 0.22;
          choppy = mix(choppy, 1.0, 0.2);
        }
        return h;
      }

      // Map function for ray marching
      float map(vec3 p, float t) {
        return p.y - sea(p.xz, t);
      }

      // Map with detail for normals
      float map_detailed(vec3 p, float t) {
        return p.y - sea(p.xz, t);
      }

      vec3 getNormal(vec3 p, float t) {
        vec3 n;
        n.y = map_detailed(p, t);
        n.x = map_detailed(vec3(p.x + 0.01, p.y, p.z), t) - n.y;
        n.z = map_detailed(vec3(p.x, p.y, p.z + 0.01), t) - n.y;
        n.y = 0.01;
        return normalize(n);
      }

      float diffuse(vec3 n, vec3 l, float p) {
        return pow(dot(n, l) * 0.4 + 0.6, p);
      }

      float specular(vec3 n, vec3 l, vec3 e, float s) {
        float nrm = (s + 8.0) / (PI * 8.0);
        return pow(max(dot(reflect(e, n), l), 0.0), s) * nrm;
      }

      vec3 getSkyColor(vec3 e) {
        e.y = max(e.y, 0.0);
        vec3 ret;
        ret.x = pow(1.0 - e.y, 2.0);
        ret.y = 1.0 - e.y;
        ret.z = 0.6 + (1.0 - e.y) * 0.4;
        return ret;
      }

      vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, float dist) {
        float fresnel = clamp(1.0 - dot(n, -eye), 0.0, 1.0);
        fresnel = pow(fresnel, 3.0) * 0.5;

        vec3 reflected = getSkyColor(reflect(eye, n));
        vec3 refracted = vec3(0.0, 0.06, 0.12) + diffuse(n, l, 80.0) * vec3(0.05, 0.15, 0.25) * 0.12;

        refracted += specular(n, l, eye, 60.0) * vec3(0.8, 0.9, 1.0);
        refracted += specular(n, l, eye, 30.0) * vec3(0.5, 0.6, 0.7) * 0.5;

        vec3 col = mix(refracted, reflected, fresnel);

        float atten = max(1.0 - dist * 0.004, 0.0);
        col += vec3(0.0, 0.08, 0.15) * (p.y - sea(p.xz, uTime)) * 0.4 * atten;

        return col;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        float aspect = uResolution.x / uResolution.y;
        vec2 p = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);

        float time = uTime * 0.3;

        // Camera
        vec3 ang = vec3(0.0, 0.15, 0.0);
        vec3 ori = vec3(0.0, 3.5, 5.0);
        vec3 dir = normalize(vec3(p.xy, -1.5));

        // Ray march to sea
        vec3 p3 = ori + dir * 3.0;
        float dist = 0.0;
        float h = 0.0;
        float dh = 0.0;

        for (int i = 0; i < 80; i++) {
          h = map(p3, time);
          if (h < 0.01 || dist > 80.0) break;
          dist += h;
          p3 = ori + dir * dist;
        }

        vec3 lightDir = normalize(vec3(0.0, 1.0, 0.8));

        vec3 col = vec3(0.0);

        if (dist < 80.0) {
          vec3 n = getNormal(p3, time);
          col = getSeaColor(p3, n, lightDir, dir, dist);

          // Horizon fog
          col = mix(col, getSkyColor(dir), 1.0 - exp(-dist * dist * 0.0001));
        } else {
          col = getSkyColor(dir);
        }

        // Sun
        float sunDot = max(dot(dir, lightDir), 0.0);
        col += vec3(1.0, 0.9, 0.7) * pow(sunDot, 8.0) * 0.3;
        col += vec3(1.0, 0.85, 0.6) * pow(sunDot, 32.0) * 0.5;

        // Tone mapping
        col = pow(col, vec3(0.4545));
        col = clamp(col, 0.0, 1.0);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const saturnFragmentSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;

      #define PI 3.14159265359

      float hash(float n) { return fract(sin(n) * 43758.5453123); }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = i.x + i.y * 57.0;
        return mix(mix(hash(n), hash(n + 1.0), f.x),
                   mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.03;
          a *= 0.5;
        }
        return v;
      }

      mat3 rotX(float a) {
        float s = sin(a), c = cos(a);
        return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
      }

      float iSphere(vec3 ro, vec3 rd, float r) {
        float b = dot(ro, rd);
        float c = dot(ro, ro) - r * r;
        float h = b * b - c;
        if (h < 0.0) return -1.0;
        return -b - sqrt(h);
      }

      float iRingPlane(vec3 ro, vec3 rd, vec3 n, float inner, float outer) {
        float denom = dot(rd, n);
        if (abs(denom) < 0.0001) return -1.0;
        float t = -dot(ro, n) / denom;
        if (t < 0.0) return -1.0;
        vec3 p = ro + rd * t;
        float r = length(p);
        if (r < inner || r > outer) return -1.0;
        return t;
      }

      // Thousands of fine ringlets - key to the reference look
      float ringPattern(float rNorm, float angle) {
        float v = 0.0;

        // Very high frequency base ringlets
        float f1 = sin(rNorm * 2500.0) * 0.5 + 0.5;
        float f2 = sin(rNorm * 1200.0 + 1.3) * 0.5 + 0.5;
        float f3 = sin(rNorm * 3800.0 + angle * 2.0) * 0.5 + 0.5;
        float f4 = sin(rNorm * 600.0 + 0.7) * 0.5 + 0.5;
        float f5 = sin(rNorm * 5000.0 + angle * 3.0) * 0.5 + 0.5;

        // Combine for dense ring structure - brighter base
        v = f1 * f2 * 0.5 + f3 * 0.2 + f4 * 0.15 + f5 * 0.15;
        v = pow(v, 0.7); // brighten mid-tones

        // Major gaps
        float cassini = smoothstep(0.465, 0.475, rNorm) * smoothstep(0.52, 0.50, rNorm);
        v *= 0.05 + 0.95 * (1.0 - cassini);

        float encke = smoothstep(0.76, 0.78, rNorm) * smoothstep(0.84, 0.82, rNorm);
        v *= 0.15 + 0.85 * (1.0 - encke);

        // Inner/outer fade
        v *= smoothstep(0.0, 0.03, rNorm);
        v *= smoothstep(1.0, 0.95, rNorm);

        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        float aspect = uResolution.x / uResolution.y;
        vec2 p = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);

        // Camera positioned so Saturn is backlit - sun behind and below
        vec3 ro = vec3(0.0, 0.15, -2.8);
        vec3 rd = normalize(vec3(p * 0.6, 1.0));

        // Sun BEHIND the planet, lower left - creates dramatic silhouette
        vec3 sunDir = normalize(vec3(-0.6, -0.3, 0.75));
        vec3 sunCol = vec3(1.0, 0.82, 0.55);

        vec3 col = vec3(0.0);

        // Planet
        vec3 planetPos = vec3(0.0, 0.0, 0.0);
        float planetRadius = 0.55;
        vec3 localRo = ro - planetPos;

        // Rings tilted
        float ringTilt = 0.42;
        mat3 ringRot = rotX(ringTilt);
        vec3 ringNormal = ringRot * vec3(0.0, 1.0, 0.0);
        float ringInner = 0.72;
        float ringOuter = 1.55;

        float tPlanet = iSphere(localRo, rd, planetRadius);
        float tRing = iRingPlane(localRo, rd, ringNormal, ringInner, ringOuter);

        // Deep black background with very subtle stars
        vec3 bgCol = vec3(0.001, 0.001, 0.002);
        float starField = pow(noise(uv * 400.0), 24.0) * 1.2;
        starField += pow(noise(uv * 700.0 + vec2(50.0)), 32.0) * 0.8;
        bgCol += vec3(0.7, 0.75, 0.9) * starField;
        col = bgCol;

        // Intense sun glow in lower left - behind planet
        vec2 sunScreen = vec2(-0.55, -0.25);
        float sunDist = length(p - sunScreen);
        float sunGlow = exp(-sunDist * sunDist * 1.8) * 0.8;
        col += sunCol * sunGlow;

        // Sun rays
        float sunAngle = atan(p.y - sunScreen.y, p.x - sunScreen.x);
        float rays = pow(max(cos(sunAngle * 12.0), 0.0), 40.0) * 0.3;
        rays += pow(max(cos(sunAngle * 6.0), 0.0), 30.0) * 0.2;
        col += sunCol * rays * exp(-sunDist * 1.2) * 0.4;

        // Render rings behind planet
        if (tRing > 0.0 && (tPlanet < 0.0 || tRing < tPlanet)) {
          vec3 pos = localRo + rd * tRing;
          float r = length(pos);
          float angle = atan(pos.z, pos.x);
          float rNorm = (r - ringInner) / (ringOuter - ringInner);

          // Dense ringlets
          float ringlets = ringPattern(rNorm, angle);

          // Subtle noise texture
          float tex = fbm(vec2(angle * 15.0, rNorm * 80.0)) * 0.3 + 0.7;

          // GOLDEN/AMBER ring colors - warm vivid tones
          vec3 ringColA = vec3(1.0, 0.82, 0.45);   // bright gold
          vec3 ringColB = vec3(0.98, 0.72, 0.32);  // amber
          vec3 ringColC = vec3(0.92, 0.62, 0.25);  // deep gold
          vec3 ringColD = vec3(0.82, 0.52, 0.20);  // burnt orange
          vec3 ringCol;
          if (rNorm < 0.33) {
            ringCol = mix(ringColA, ringColB, rNorm * 3.0);
          } else if (rNorm < 0.66) {
            ringCol = mix(ringColB, ringColC, (rNorm - 0.33) * 3.0);
          } else {
            ringCol = mix(ringColC, ringColD, (rNorm - 0.66) * 3.0);
          }

          // Ring geometry for lighting
          vec3 ringTangent = normalize(vec3(-pos.z, 0.0, pos.x));
          vec3 ringUp = cross(ringTangent, normalize(pos));

          // Planet shadow on rings
          float inShadow = 0.0;
          float shadowT = iSphere(pos - planetPos, sunDir, planetRadius);
          if (shadowT > 0.0) {
            vec3 shadowPoint = pos + sunDir * shadowT;
            float distFromCenter = length(shadowPoint) / planetRadius;
            inShadow = 1.0 - smoothstep(0.9, 1.1, distFromCenter);
          }

          // Ring alpha - much more opaque
          float alpha = ringlets * tex * 1.4;
          alpha *= smoothstep(ringInner, ringInner + 0.008, r);
          alpha *= smoothstep(ringOuter, ringOuter - 0.015, r);

          // Backlit rings glow golden when sun shines through
          float sunDotRing = max(dot(-ringUp, sunDir), 0.0);
          float backlitGlow = sunDotRing * (1.0 - inShadow * 0.9);

          // Ring color: golden base + intense backlit scattering
          vec3 ringFinal = ringCol * ringlets * tex * 1.2;
          // Strong translucency glow - the key visual feature
          ringFinal += sunCol * backlitGlow * 3.0 * ringlets;
          ringFinal += vec3(1.0, 0.75, 0.35) * backlitGlow * 1.5;

          // In shadow, rings are darker but still golden
          ringFinal *= (0.15 + 0.85 * (1.0 - inShadow));

          col = mix(col, ringFinal, alpha);
        }

        // Render planet as dark SILHOUETTE with bright limb
        if (tPlanet > 0.0) {
          vec3 pos = localRo + rd * tPlanet;
          vec3 norm = normalize(pos);

          // Sun is behind the planet, so diffuse is near zero on visible face
          float diff = max(dot(norm, sunDir), 0.0);

          // View dot for limb calculation
          float viewDot = max(dot(norm, -rd), 0.0);

          // Planet is mostly black silhouette
          vec3 surfCol = vec3(0.01, 0.008, 0.006);

          // VERY faint banding on dark side (just barely visible)
          float lat = asin(clamp(norm.y, -1.0, 1.0));
          float lon = atan(norm.z, norm.x);
          float bandNoise = fbm(vec2(lon * 3.0, lat * 20.0)) * 0.08;
          float faintBand = sin(lat * 16.0 + bandNoise) * 0.5 + 0.5;
          surfCol += vec3(0.02, 0.015, 0.01) * faintBand * 0.15;

          // Ring shadow on planet
          float ringShadow = 1.0;
          vec3 equatorPlane = ringRot * vec3(0.0, 1.0, 0.0);
          float distToRingPlane = abs(dot(pos, equatorPlane));
          float ringRadialDist = length(pos - equatorPlane * dot(pos, equatorPlane));
          if (ringRadialDist > ringInner && ringRadialDist < ringOuter && distToRingPlane < 0.03) {
            float tShadowRing = iRingPlane(pos, sunDir, ringNormal, ringInner, ringOuter);
            if (tShadowRing > 0.0) ringShadow = 0.2;
          }
          surfCol *= ringShadow;

          // Planet base = very dark
          col = surfCol;

          // BRIGHT LIMB where sun grazes the edge - the signature sunrise effect
          // This is where the planet edge catches the sunlight
          float limb = pow(1.0 - viewDot, 3.0);
          float limbLight = pow(max(diff, 0.0), 0.25); // Grazing angle light

          // The lit limb is bright gold/white - very intense
          vec3 limbCol = vec3(1.0, 0.88, 0.55) * limb * limbLight * 5.0;
          vec3 limbWarm = vec3(1.0, 0.72, 0.35) * limb * limbLight * 3.5;
          col += limbCol + limbWarm;

          // Extended atmospheric scattering around the lit limb
          float atmoLimb = pow(1.0 - viewDot, 1.5);
          float sunAlignment = pow(max(dot(-norm, sunDir), 0.0), 1.0);
          vec3 atmoCol = vec3(1.0, 0.78, 0.4) * atmoLimb * sunAlignment * 1.0;
          atmoCol += vec3(1.0, 0.92, 0.75) * atmoLimb * sunAlignment * 0.5;
          col += atmoCol;
        }

        // Strong atmospheric glow around planet silhouette when viewed from space
        if (tPlanet < 0.0) {
          // Distance from planet center in screen space approximation
          float planetScreenRadius = planetRadius * 0.75;
          float distFromCenter = length(p);
          float distToEdge = abs(distFromCenter - planetScreenRadius);

          // Glow concentrated at the limb facing the sun
          float limbGlow = exp(-distToEdge * distToEdge * 8.0) * 0.4;

          // Only glow on the sun-facing side (lower left)
          float sunFacing = smoothstep(-0.3, 0.5, -p.x * 0.7 - p.y * 0.5);
          limbGlow *= sunFacing;

          col += vec3(1.0, 0.78, 0.4) * limbGlow;
        }

        // Post-processing: high contrast, warm tone
        col = pow(col, vec3(0.4545));
        // Slight contrast boost
        col = col * 1.1 - 0.02;
        col = clamp(col, 0.0, 1.0);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    let program: WebGLProgram | null = null;
    const start = performance.now();
    const rainIntensity = 1.08;

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
        aria-label="Switch background scene"
      >
        {effect === "rain" ? "Stars" : effect === "stars" ? "Seascape" : effect === "seascape" ? "Saturn" : "Rain"}
      </button>
    </>
  );
}
