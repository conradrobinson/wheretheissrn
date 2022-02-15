varying vec3 vectorNormal;


void main() {
    vectorNormal = normalize(normal * normalMatrix);
    gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1);
}