precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
uniform vec3 color;
uniform float time;
uniform sampler2D textureMap;
uniform float textureWidth;
uniform float textureHeight;
uniform vec2 planeScale;

void main() {
    vec3 normal = normalize(vNormal);

    // Calculate the aspect ratios
    float textureRatio = textureWidth / textureHeight;
    float planeRatio = planeScale.x / planeScale.y;

    // Calculate the scale factor for the UV adjustment
    vec2 scaleFactor = vec2(1.0);
    scaleFactor.x = min(1.0, planeRatio / textureRatio);
    scaleFactor.y = min(1.0, textureRatio / planeRatio);

    // Adjust UV coordinates to maintain aspect ratio and center the texture
    vec2 adjustedUv = (vUv - 0.5) * scaleFactor + 0.5;

    // Sample the texture using the adjusted UV coordinates
    vec3 tex = texture2D(textureMap, adjustedUv).rgb;

    // Apply the sampled texture color
    vec3 finalColor = tex;

    // Output the final color
    gl_FragColor.rgb = finalColor;
    gl_FragColor.a = 1.0;
}
