uniform sampler2D globeTexture;
varying vec2 vertexUV;
varying vec3 vectorNormal;

void main() {
    float intesity = 1.05 - dot(vectorNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intesity, 2.0);
    gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);

}