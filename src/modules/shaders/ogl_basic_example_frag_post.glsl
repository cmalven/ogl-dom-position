#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D tMap;
uniform vec2 uResolution;
varying vec2 vUv;

#include "lygia/filter/noiseBlur.glsl";

void main() {
    vec3 color = vec3(0.0);
    vec2 pixel = 1.0/uResolution;
    vec2 st = gl_FragCoord.xy * pixel;
    float ix = floor(st.x * 5.0);
    float radius = max(1.0, ix * 6.0);

    // Add blur
    color += noiseBlur(tMap, st, pixel, radius).rgb;

    // Add divider lines
    color -= step(.995, fract(st.x * 7.0));

    gl_FragColor = vec4(color, color.r);
}
