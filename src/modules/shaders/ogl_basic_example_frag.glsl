precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
uniform sampler2D textureMap;
uniform vec3 color;
uniform float time;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 tex = texture2D(textureMap, vUv).rgb;

    vec3 color = tex * color + 0.2;
    float colorShift = 0.5 + 0.5 * sin(time * 2.5);
    color += vec3(0.0, 0.0, colorShift);

    gl_FragColor.rgb = color;
    gl_FragColor.a = 1.0;
}
