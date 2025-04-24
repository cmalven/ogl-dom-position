precision highp float;
varying vec2 vUv;
varying float vDist;
uniform float time;
uniform sampler2D textureMap;
uniform vec2 scrollOffset;
uniform vec2 domWH;
uniform float textureWidth;
uniform float textureHeight;

void main() {
    // Create a copy of uv to modify if needed
    vec2 modUv = vUv;

    // Calculate the aspect ratios
    float textureRatio = textureWidth / textureHeight;
    float planeRatio = domWH.x / domWH.y;

    // Calculate the scale factor for the UV adjustment
    vec2 scaleFactor = vec2(1.0);
    scaleFactor.x = min(1.0, planeRatio / textureRatio);
    scaleFactor.y = min(1.0, textureRatio / planeRatio);

    // Adjust UV coordinates to maintain aspect ratio and center the texture
    vec2 adjustedUv = (vUv - 0.5) * scaleFactor + 0.5;

    // Get the texture
    vec3 tex = texture2D(textureMap, adjustedUv).rgb;

    // Apply the sampled texture color
    vec3 finalColor = tex;

    // Output the final color
    gl_FragColor.rgb = finalColor;
    gl_FragColor.a = 1.0;
}
