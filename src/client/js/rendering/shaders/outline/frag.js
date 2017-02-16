define([

], function(

) {
    return `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;

        uniform float thickness;
        uniform vec4 outlineColor;
        uniform float pixelWidth;
        uniform float alpha;
        vec2 px = vec2(pixelWidth, pixelWidth);

        void main(void) {
            const float PI = 3.14159265358979323846264;
            vec4 ownColor = texture2D(uSampler, vTextureCoord);
            vec4 curColor;
            float maxAlpha = 0.;
            for (float angle = 0.; angle < PI * 2.; angle += %THICKNESS% ) {
                curColor = texture2D(uSampler, vec2(vTextureCoord.x + thickness * px.x * cos(angle), vTextureCoord.y + thickness * px.y * sin(angle)));
                maxAlpha = max(maxAlpha, curColor.a);
            }
            if (maxAlpha > 0.1)
                maxAlpha = alpha;
            else
                maxAlpha = 0.0;
            float resultAlpha = max(maxAlpha, ownColor.a);
            gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);
        }
    `;
});