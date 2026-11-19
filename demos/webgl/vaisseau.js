// Travail 3 - LAMG03049900 (Guillaume Lamontagne Morin)
//
//
// This program was developped by Daniel Audet and uses the file "basic-objects-IFS.js"
// from http://math.hws.edu/eck/cs424/notes2013/19_GLSL.html
//
//  It has been adapted to be compatible with the "MV.js" library developped
//  for the book "Interactive Computer Graphics" by Edward Angel and Dave Shreiner.
//

"use strict";

var gl;   // The webgl context.
var canvas;

var CoordsLoc;       // Location of the coords attribute variable in the standard texture mappping shader program.
var NormalLoc;
var TexCoordLoc;

var ProjectionLoc;     // Location of the uniform variables in the standard texture mappping shader program.
var ModelviewLoc;
var NormalMatrixLoc;
var textureLoc;
var renderingoptionLoc;

var a_coordsmapLoc;      // Location of the attribute variables in the environment mapping shader program.
var a_normalmapLoc;

var u_projectionmapLoc;     // Location of the uniform variables in the environment mapping shader program.
var u_modelviewmapLoc;
var u_normalmatrixmapLoc;
var u_minvmapLoc;
var u_skyboxmapLoc;

var projection;   //--- projection matrix
var modelview;    // modelview matrix
var flattenedmodelview;    //--- flattened modelview matrix

var normalMatrix = mat3();  //--- create a 3X3 matrix that will affect normals

var normalmatrix = mat3();  //--- create a 3X3 matrix that will affect normals
var localmodelview;

var rotator;   // A SimpleRotator object to enable rotation by mouse dragging.

var minv = mat3();  // matrix inverse of modelview

var sphere, cylinder, box, teapot, disk, torus, cone;  // model identifiers
var hemisphereinside, hemisphereoutside, thindisk;
var quartersphereinside, quartersphereoutside;
var triangularPrism;
var reflectiveBox;

var prog, progmap, progbox;  // shader program identifier

var lightPosition = vec4(20.0, 20.0, 100.0, 1.0);

var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var materialDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
var materialSpecular = vec4(0.5, 0.5, 0.5, 1.0);
var materialShininess = 5.0;

var	materialAmbientBody = vec4(0.68, 0.68, 0.68, 1.0);
var	materialDiffuseBody = vec4(0.5, 0.5, 0.5, 1.0);
var	materialSpecularBody = vec4(0.5, 0.5, 0.5, 1.0);
var	materialShininessBody = 15.0;
var BodyTexID;
var BodyTexNB;
var BodyGlTex;

var	materialAmbientWeapon = vec4(0.34, 0.34, 0.34, 1.0);
var	materialDiffuseWeapon = vec4(0.5, 0.5, 0.5, 1.0);
var	materialSpecularWeapon = vec4(0.5, 0.5, 0.5, 1.0);
var	materialShininessWeapon = 15.0;
var WeaponTexID;
var WeaponTexNB;
var WeaponGlTex;

var	materialAmbientWing = vec4(0.5, 0.34, 0.34, 1.0);
var	materialDiffuseWing = vec4(0, 0, 0, 1.0);
var	materialSpecularWing = vec4(0, 0, 0, 1.0);
var	materialShininessWing = 15.0;
var WingTexID;
var WingTexNB;
var WingGlTex;

var	materialAmbientGlass = vec4(0, 0, 0, 1.0);
var	materialDiffuseGlass = vec4(0.8, 0.8, 0.8, 1.0);
var	materialSpecularGlass = vec4(0.8, 0.8, 0.8, 1.0);
var	materialShininessGlass = 100;
var GlassTexID;
var GlassTexNB;
var GlassGlTex;

var materialAmbientConnector = vec4(0, 0, 0, 1.0);
var materialDiffuseConnector = vec4(0, 0, 0, 1.0);
var materialSpecularConnector = vec4(0, 0, 0, 1.0);
var materialShininessConnector = 1.0;
var ConnectorTexID;
var ConnectorTexNB;
var ConnectorGlTex;

var materialAmbientEarth = vec4(0.6, 0.6, 0.7, 1.0);
var materialDiffuseEarth = vec4(0.2, 0.2, 0.3, 1.0);
var materialSpecularEarth = vec4(0.1, 0.1, 0.2, 1.0);
var materialShininessEarth = 1.0;
var EarthTexID;
var EarthTexNB;
var EarthGlTex;

var materialAmbientJupiter = vec4(0, 0, 0.2, 1.0);
var materialDiffuseJupiter = vec4(0, 0, 0, 1.0);
var materialSpecularJupiter = vec4(0, 0, 0, 1.0);
var materialShininessJupiter = 1.0;
var JupiterTexID;
var JupiterTexNB;
var JupiterGlTex;

var materialAmbientMoon = vec4(0, 0, 0.2, 1.0);
var materialDiffuseMoon = vec4(0, 0, 0, 1.0);
var materialSpecularMoon = vec4(0, 0, 0, 1.0);
var materialShininessMoon = 1.0;
var MoonTexID;
var MoonTexNB;
var MoonGlTex;

var thetaPlanets = 0;
var spinFunctionCaller;

var SkyboxMapTexID;
var img = new Array(6);
var vcoordsboxLoc;     // Location of the coords attribute variable in the shader program used for texturing the environment box.
var vnormalboxLoc;
var vtexcoordboxLoc;
var modelviewboxLoc;
var projectionboxLoc;
var skyboxLoc;
var envbox;  // model identifiers
var ct = 0;
var initialmodelview;

var starwarsARC170;
var starwarsARC170displacement;
var modelscalefactor = 1.0;
var texcounter = 0;
var texturelist = [];

var ambientProduct, diffuseProduct, specularProduct;

var xoffset = 10, yoffset = 0, zoffset = -15;

var reflexion;
	
var ntextures_tobeloaded = 0, ntextures_loaded = 0;

function drawBox(iniModelView, posx, posy, posz, rforce, rx, ry, rz, scalex, scaley, scalez){
    modelview = iniModelView;
    modelview = mult(modelview, translate(0, 0, zoffset));
    modelview = mult(modelview, rotate(xoffset, 0, 1, 0));
    modelview = mult(modelview, translate(posx, posy, posz));
    modelview = mult(modelview, rotate(rforce, rx, ry, rz));
    normalMatrix = extractNormalMatrix(modelview);
    modelview = mult(modelview, scale(scalex, scaley, scalez));
    box.render();
}
function drawSpinningBox(iniModelView, posx, posy, posz, rforce, rx, ry, rz, scalex, scaley, scalez, thetaRotateForce){
    gl.useProgram(progmap); // Select the shader program that is used for the environment box.

    gl.uniformMatrix4fv(u_projectionmapLoc, false, flatten(projection));  // send projection matrix to the new shader program

    normalmatrix = extractNormalMatrix(modelview);  // always extract normalmatrix before scaling

    gl.enableVertexAttribArray(a_coordsmapLoc);
    gl.enableVertexAttribArray(a_normalmapLoc);
    
    // associate texture image to "texture unit" 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyboxMapTexID);

    // Send texture number to sampler
    gl.uniform1i(u_skyboxmapLoc, 0);

    modelview = iniModelView;
    modelview = mult(modelview, translate(0, 0, zoffset));
    modelview = mult(modelview, rotate(xoffset, 0, 1, 0));
    modelview = mult(modelview, translate(posx, posy, posz));
    modelview = mult(modelview, rotate(thetaPlanets * thetaRotateForce, 0, 1, 0));
    modelview = mult(modelview, rotate(rforce, rx, ry, rz));
    normalMatrix = extractNormalMatrix(modelview);
    modelview = mult(modelview, scale(scalex, scaley, scalez));
    reflectiveBox.render();
    
    gl.useProgram(prog);
}
function drawPlanet(iniModelView, posx, posy, posz, rforce, rx, ry, rz, scalex, scaley, scalez, thetaRotateForce){
    modelview = iniModelView;
    modelview = mult(modelview, rotate(xoffset, 0, 1, 0));
    modelview = mult(modelview, translate(posx, posy, posz));
    modelview = mult(modelview, rotate(thetaPlanets * thetaRotateForce, 0, 1, 0));
    modelview = mult(modelview, rotate(rforce, rx, ry, rz));
    normalMatrix = extractNormalMatrix(modelview);
    modelview = mult(modelview, scale(scalex, scaley, scalez));
    sphere.render();
}
function drawMoon(iniModelView, posx, posy, posz, rforce, rx, ry, rz, scalex, scaley, scalez, thetaRotateForce){
    modelview = iniModelView;
    modelview = mult(modelview, rotate(xoffset, 0, 1, 0));
    modelview = mult(modelview, translate(Math.cos(thetaPlanets * 0.3)*100, 0, Math.sin(thetaPlanets * 0.3)*100));
    modelview = mult(modelview, translate(posx, posy, posz));
    //modelview = mult(modelview, rotate(thetaPlanets * thetaRotateForce, 0, 1, 0));
    modelview = mult(modelview, rotate(rforce, rx, ry, rz));
    normalMatrix = extractNormalMatrix(modelview);
    modelview = mult(modelview, scale(scalex, scaley, scalez));
    sphere.render();
}
function drawPrism(iniModelView, posx, posy, posz, rforce, rx, ry, rz, scalex, scaley, scalez){
	modelview = iniModelView;
    modelview = mult(modelview, translate(0, 0, zoffset));
    modelview = mult(modelview, rotate(xoffset, 0, 1, 0));
	modelview = mult(modelview, translate(posx, posy, posz));
	modelview = mult(modelview, rotate(rforce, rx, ry, rz));
	normalMatrix = extractNormalMatrix(modelview);
	modelview = mult(modelview, scale(scalex, scaley, scalez));
	triangularPrism.render();
}
function drawBoxTwoRotation(iniModelView, posx, posy, posz, rforce1, rx1, ry1, rz1, rforce2, rx2, ry2, rz2, scalex, scaley, scalez){
	modelview = iniModelView;
    modelview = mult(modelview, translate(0, 0, zoffset));
    modelview = mult(modelview, rotate(xoffset, 0, 1, 0));
	modelview = mult(modelview, translate(posx, posy, posz));
	modelview = mult(modelview, rotate(rforce1, rx1, ry1, rz1));
	modelview = mult(modelview, rotate(rforce2, rx2, ry2, rz2));
	normalMatrix = extractNormalMatrix(modelview);
	modelview = mult(modelview, scale(scalex, scaley, scalez));
	box.render();
}
function drawPrismTwoRotation(iniModelView, posx, posy, posz, rforce1, rx1, ry1, rz1, rforce2, rx2, ry2, rz2, scalex, scaley, scalez){
    modelview = iniModelView;
    modelview = mult(modelview, translate(0, 0, zoffset));
    modelview = mult(modelview, rotate(xoffset, 0, 1, 0));
    modelview = mult(modelview, translate(posx, posy, posz));
    modelview = mult(modelview, rotate(rforce1, rx1, ry1, rz1));
    modelview = mult(modelview, rotate(rforce2, rx2, ry2, rz2));
    normalMatrix = extractNormalMatrix(modelview);
    modelview = mult(modelview, scale(scalex, scaley, scalez));
    triangularPrism.render();
}
function drawSkybox(){
    modelview = unflatten(flattenedmodelview);

    if (SkyboxMapTexID.isloaded ) {  // if texture images have been loaded
        initialmodelview = modelview;
        modelview = mult(modelview, scale(250,250,250));
        modelview = mult(modelview, rotate(xoffset, 0, 1, 0));
        // Draw the environment (box)
        gl.useProgram(progbox); // Select the shader program that is used for the environment box.
        gl.uniformMatrix4fv(projectionboxLoc, false, flatten(projection));
        gl.enableVertexAttribArray(vcoordsboxLoc);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyboxMapTexID);
        // Send texture to sampler
        gl.uniform1i(skyboxLoc, 0);
        envbox.render();
    }
}
function drawImportedShip(iniModelView){
    modelview = iniModelView;
    modelview = mult(modelview, translate(0, 0, zoffset));
    modelview = mult(modelview, rotate(xoffset, 0, 1, 0));
    modelview = mult(modelview, translate(70.0, -10.0, -80.0));
    modelview = mult(modelview, rotate(-30.0, 1, 0, 0));
    modelview = mult(modelview, rotate(-175.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(modelscalefactor, modelscalefactor, modelscalefactor));
    modelview = mult(modelview, scale(1.5, 1.5, 1.5));      
    starwarsARC170.render();
}
function loadTex(texID, texNB, glTex){
    gl.activeTexture(glTex);
    gl.bindTexture(gl.TEXTURE_2D, texID);
    gl.uniform1i(textureLoc, texNB);
}
function render() {
    gl.clearColor(0, 0, 0.05, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    flattenedmodelview = rotator.getViewMatrix();
    modelview = unflatten(flattenedmodelview);
	
	normalMatrix = extractNormalMatrix(modelview);
	
	if(ntextures_tobeloaded == ntextures_loaded){
	
		initialmodelview = modelview;

        gl.useProgram(prog);

		//Body center (Main box, bottom front inside square, Bottom front prism, top front prism)
		changeColor(materialAmbientBody, materialDiffuseBody, materialSpecularBody, materialShininessBody);
		loadTex(BodyTexID, BodyTexNB, BodyGlTex);
		drawBox(initialmodelview, 0, -1.75, 0,  0, 1, 0, 0,  0.5, 0.85, 3);
		drawBox(initialmodelview, 0, -3.5, 18.75,  0, 1, 0, 0,  0.5, 0.5, 0.75);
		drawPrismTwoRotation(initialmodelview, 0, -5, 26.25,  90, 0, 1, 0, 180, 1, 0, 0,  0.75, 0.2, 0.5);
		drawPrism(initialmodelview, 0, -2.5, 26.25,  90, 0, 1, 0,  0.75, 0.3, 0.5);
		
		
		loadTex(BodyTexID, BodyTexNB, gl.TEXTURE0);
		
		//Top of body
		changeColor(materialAmbientGlass, materialDiffuseGlass, materialSpecularGlass, materialShininessGlass);
		loadTex(GlassTexID, GlassTexNB, GlassGlTex);
		drawPrism(initialmodelview, 0, 0.75, 18.75,  90, 0, 1, 0,  0.75, 0.35, 0.5);
		//Top Wing
		changeColor(materialAmbientWing, materialDiffuseWing, materialSpecularWing, materialShininessWing);
		loadTex(WingTexID, WingTexNB, WingGlTex);
		drawBox(initialmodelview, 0, 12, -6.5,  90, 0, 1, 0,  1, 2, 0.05);
		drawBox(initialmodelview, 0, 4.5, -12.5,  90, 0, 1, 0, 0.2, 0.4, 0.05);
		drawBox(initialmodelview, 0, 14.5, -12.5,  90, 0, 1, 0,  0.2, 1.5, 0.05);
		drawPrism(initialmodelview, 0, 12, 6,  90, 0, 1, 0,  1.5, 2, 0.05);

		for (reflexion = -1; reflexion < 2; reflexion+=2){
			//Side-top main body connection
			changeColor(materialAmbientBody, materialDiffuseBody, materialSpecularBody, materialShininessBody);
			loadTex(BodyTexID, BodyTexNB, BodyGlTex);
			drawBox(initialmodelview, 2.5 * reflexion, -1, 0.001,  45, 0, 0, 1,  0.5, 0.5, 3);
			
			//Sides of main body (prisms at the front and cubes at the sides)
			drawBox(initialmodelview, 4.25 * reflexion, -3.5, 0,  0, 1, 0, 0,  0.35, 0.5, 3);
			drawPrismTwoRotation(initialmodelview, 4.25 * reflexion, -3.5, 18.75, 90, 0, 1, 0, 90 * reflexion, 1, 0, 0,  0.75, 0.35, 0.5);
			
			//Side canons
			changeColor(materialAmbientWeapon, materialDiffuseWeapon, materialSpecularWeapon, materialShininessWeapon);
			loadTex(WeaponTexID, WeaponTexNB, WeaponGlTex);
			drawBox(initialmodelview, 9 * reflexion, -4.5, 0,  0, 1, 0, 0,  0.5, 0.3, 3);
            loadTex(ConnectorTexID, ConnectorTexNB, ConnectorGlTex);
            drawBox(initialmodelview, 5 * reflexion, -4.5, 0,  0, 1, 0, 0,  0.45, 0.25, 2.95);
			
			//Canons' wings
			changeColor(materialAmbientWing, materialDiffuseWing, materialSpecularWing, materialShininessWing);
			loadTex(WingTexID, WingTexNB, WingGlTex);
			drawBoxTwoRotation(initialmodelview, 17.25 * reflexion, 3.25, -6.5,  90, 0, 1, 0, 45 * reflexion, 1, 0, 0,  1, 2, 0.05);
			drawBoxTwoRotation(initialmodelview, 12 * reflexion, -2, -12.5,  90, 0, 1, 0, 45 * reflexion, 1, 0, 0, 0.2, 0.4, 0.05);
			drawBoxTwoRotation(initialmodelview, 19 * reflexion, 5, -12.5,  90, 0, 1, 0, 45 * reflexion, 1, 0, 0,  0.2, 1.5, 0.05);
			drawPrismTwoRotation(initialmodelview, 17.25 * reflexion, 3.25, 6,  90, 0, 1, 0, 45 * reflexion, 1, 0, 0,  1.5, 2, 0.05);
		
			//Side wings
			if (reflexion < 1){
				drawPrism(initialmodelview, 21.5 * reflexion, -5.5, 0,  0, 1, 0, 0,  2, 0.1, 1.5);
			} else {
				drawPrism(initialmodelview, 21.5 * reflexion, -5.5, 0, 180, 0, 1, 0,  2, 0.1, 1.5);
			}
		}
        changeColor(materialAmbientEarth, materialDiffuseEarth, materialSpecularEarth, materialShininessEarth);
        loadTex(EarthTexID, EarthTexNB, EarthGlTex);
        drawPlanet(initialmodelview, 150, 70, -200,  -90, 1, 0, 0,  4, 4, 4, 10);
        loadTex(MoonTexID, MoonTexNB, MoonGlTex);
        drawMoon(initialmodelview, 150, 70, -200,  -90, 1, 0, 0,  1, 1, 1, 3);
        loadTex(JupiterTexID, JupiterTexNB, JupiterGlTex);
        drawPlanet(initialmodelview, -90, -50, -100,  -90, 1, 0, 0,  4, 4, 4, 15);
        
        drawSpinningBox(initialmodelview, -40, -15, -50,  0, 1, 0, 0,  2, 2, 2, 10);
        //drawSpinningBox(initialmodelview, 0, 0, 0,  0, 1, 0, 0,  2, 2, 2, 10);

        //drawImportedShip(initialmodelview);
        drawSkybox();
		normalMatrix = extractNormalMatrix(modelview);
		var initialmodelview = modelview;
	}
}

function changeColor(matAmbient, matDiffuse, matSpecular, matShininess) {
		ambientProduct = mult(lightAmbient, matAmbient);
		diffuseProduct = mult(lightDiffuse, matDiffuse);
		specularProduct = mult(lightSpecular, matSpecular);
		materialShininess = matShininess;
		
		gl.uniform4fv(gl.getUniformLocation(prog, "ambientProduct"), flatten(ambientProduct));
		gl.uniform4fv(gl.getUniformLocation(prog, "diffuseProduct"), flatten(diffuseProduct));
		gl.uniform4fv(gl.getUniformLocation(prog, "specularProduct"), flatten(specularProduct));
		gl.uniform1f(gl.getUniformLocation(prog, "shininess"), materialShininess);
}

function unflatten(matrix) {
    var result = mat4();
    result[0][0] = matrix[0]; result[1][0] = matrix[1]; result[2][0] = matrix[2]; result[3][0] = matrix[3];
    result[0][1] = matrix[4]; result[1][1] = matrix[5]; result[2][1] = matrix[6]; result[3][1] = matrix[7];
    result[0][2] = matrix[8]; result[1][2] = matrix[9]; result[2][2] = matrix[10]; result[3][2] = matrix[11];
    result[0][3] = matrix[12]; result[1][3] = matrix[13]; result[2][3] = matrix[14]; result[3][3] = matrix[15];

    return result;
}

function initTexture() {
    BodyTexID = gl.createTexture();
    BodyTexID.image = new Image();
    BodyTexID.image.onload = function () {
        handleLoadedTexture(BodyTexID)
    }
    BodyTexID.image.src = "5.jpg";
    BodyTexNB = 0;
    BodyGlTex = gl.TEXTURE0;
	ntextures_tobeloaded++;


    WingTexID = gl.createTexture();
    WingTexID.image = new Image();
    WingTexID.image.onload = function () {
        handleLoadedTexture(WingTexID)
    }
    WingTexID.image.src = "metalscratch.png";
    WingTexNB = 1;
    WingGlTex = gl.TEXTURE1;
	ntextures_tobeloaded++;


    WeaponTexID = gl.createTexture();
    WeaponTexID.image = new Image();
    WeaponTexID.image.onload = function () {
        handleLoadedTexture(WeaponTexID)
    }
    WeaponTexID.image.src = "metal_2.jpg";
    WeaponTexNB = 2;
    WeaponGlTex = gl.TEXTURE2;
	ntextures_tobeloaded++;


    GlassTexID = gl.createTexture();
    GlassTexID.image = new Image();
    GlassTexID.image.onload = function () {
        handleLoadedTexture(GlassTexID)
    }
    GlassTexID.image.src = "glass.jpg";
    GlassTexNB = 3;
    GlassGlTex = gl.TEXTURE3;
	ntextures_tobeloaded++;


    ConnectorTexID = gl.createTexture();
    ConnectorTexID.image = new Image();
    ConnectorTexID.image.onload = function () {
        handleLoadedTexture(ConnectorTexID)
    }
    ConnectorTexID.image.src = "blackTexture2.jpg";
    ConnectorTexNB = 4;
    ConnectorGlTex = gl.TEXTURE4;
    ntextures_tobeloaded++;


    EarthTexID = gl.createTexture();
    EarthTexID.image = new Image();
    EarthTexID.image.onload = function () {
        handleLoadedTexture(EarthTexID)
    }
    EarthTexID.image.src = "earthmap.jpg";
    EarthTexNB = 5;
    EarthGlTex = gl.TEXTURE5;
    ntextures_tobeloaded++;


    JupiterTexID = gl.createTexture();
    JupiterTexID.image = new Image();
    JupiterTexID.image.onload = function () {
        handleLoadedTexture(JupiterTexID)
    }
    JupiterTexID.image.src = "jupitermap.jpg";
    JupiterTexNB = 6;
    JupiterGlTex = gl.TEXTURE6;
    ntextures_tobeloaded++;


    MoonTexID = gl.createTexture();
    MoonTexID.image = new Image();
    MoonTexID.image.onload = function () {
        handleLoadedTexture(MoonTexID)
    }
    MoonTexID.image.src = "moonmap.jpg";
    MoonTexNB = 7;
    MoonGlTex = gl.TEXTURE7;
    ntextures_tobeloaded++;


    var urls = [
       "space/nebula_posx.jpg", "space/nebula_negx.jpg",
       "space/nebula_posy.jpg", "space/nebula_negy.jpg",
       "space/nebula_posz.jpg", "space/nebula_negz.jpg"
    ];

    SkyboxMapTexID = gl.createTexture();
    SkyboxMapTexID.isloaded = false;  // this class member is created only to check if the image has been loaded

    for (var i = 0; i < 6; i++) {
        img[i] = new Image();
        img[i].onload = function () {  // this function is called when the image download is complete
            handleLoadedTextureMap(SkyboxMapTexID);
        }
        img[i].src = urls[i];   // this line starts the image downloading thread
    }
}

function createModelbox(modelData) {  // For creating the environment box.
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    console.log(modelData.vertexPositions.length);
    console.log(modelData.indices.length);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(vcoordsboxLoc, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(modelviewboxLoc, false, flatten(modelview));
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
    return model;
}

function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

	ntextures_loaded++;
    render();  //--- call render function when the image has been loaded (to make sure the model is displayed)

    gl.bindTexture(gl.TEXTURE_2D, null);
}
function handleLoadedTextureMap(texture) {

    ct++;
    if (ct == 6) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        var targets = [
           gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        for (var j = 0; j < 6; j++) {
            gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        texture.isloaded = true;

        render();  // Call render function when the image has been loaded (to insure the model is displayed)

        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
function handleLoadedTextureFromObjFile(texturelist,Id) {
    gl.bindTexture(gl.TEXTURE_2D, texturelist[Id]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texturelist[Id].image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );

    ntextures_loaded++;
    render();  // Call render function when the image has been loaded (to insure the model is displayed)

    gl.bindTexture(gl.TEXTURE_2D, null);
}

function extractNormalMatrix(matrix) { // This function computes the transpose of the inverse of 
    // the upperleft part (3X3) of the modelview matrix (see http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ )

    var result = mat3();
    var upperleft = mat3();
    var tmp = mat3();

    upperleft[0][0] = matrix[0][0];  // if no scaling is performed, one can simply use the upper left
    upperleft[1][0] = matrix[1][0];  // part (3X3) of the modelview matrix
    upperleft[2][0] = matrix[2][0];

    upperleft[0][1] = matrix[0][1];
    upperleft[1][1] = matrix[1][1];
    upperleft[2][1] = matrix[2][1];

    upperleft[0][2] = matrix[0][2];
    upperleft[1][2] = matrix[1][2];
    upperleft[2][2] = matrix[2][2];

    tmp = matrixinvert(upperleft);
    result = transpose(tmp);

    return result;
}

function matrixinvert(matrix) {

    var result = mat3();

    var det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) -
                 matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                 matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);

    var invdet = 1 / det;

    // inverse of matrix m
    result[0][0] = (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) * invdet;
    result[0][1] = (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) * invdet;
    result[0][2] = (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invdet;
    result[1][0] = (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) * invdet;
    result[1][1] = (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invdet;
    result[1][2] = (matrix[1][0] * matrix[0][2] - matrix[0][0] * matrix[1][2]) * invdet;
    result[2][0] = (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]) * invdet;
    result[2][1] = (matrix[2][0] * matrix[0][1] - matrix[0][0] * matrix[2][1]) * invdet;
    result[2][2] = (matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1]) * invdet;

    return result;
}

// The following function is used to create an "object" (called "model") containing all the informations needed
// to draw a particular element (sphere, cylinder, cube,...). 
// Note that the function "model.render" is defined inside "createModel" but it is NOT executed.
// That function is only executed when we call it explicitly in render().

function createModel(modelData) {

	// the next line defines an "object" in Javascript
	// (note that there are several ways to define an "object" in Javascript)
	var model = {};
	
	// the following lines defines "members" of the "object"
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.textureBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;

	// the "members" are then used to load data from "modelData" in the graphic card
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTextureCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

	// The following function is NOT executed here. It is only DEFINED to be used later when we
	// call the ".render()" method.
    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(CoordsLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(NormalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.vertexAttribPointer(TexCoordLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniformMatrix4fv(ModelviewLoc, false, flatten(modelview));    //--- load flattened modelview matrix
        gl.uniformMatrix3fv(NormalMatrixLoc, false, flatten(normalMatrix));  //--- load flattened normal matrix

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        //console.log(this.count);
    }
	
	// we now return the "object".
    return model;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    var vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vertexShaderSource);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
    }
    var fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}

function getTextContent(elementID) {
    var element = document.getElementById(elementID);
    var fsource = "";
    var node = element.firstChild;
    var str = "";
    while (node) {
        if (node.nodeType == 3) // this is a text node
            str += node.textContent;
        node = node.nextSibling;
    }
    return str;
}

window.onload = function init() {
    try {
		
        canvas = document.getElementById("glcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            gl = canvas.getContext("experimental-webgl");
        }
        if (!gl) {
            throw "Could not create WebGL context.";
        }
	
        // LOAD SHADER (for the environment)
        var vertexShaderSource = getTextContent("vshaderbox");
        var fragmentShaderSource = getTextContent("fshaderbox");
        progbox = createProgram(gl, vertexShaderSource, fragmentShaderSource);

        gl.useProgram(progbox);

        vcoordsboxLoc = gl.getAttribLocation(progbox, "vcoords");

        modelviewboxLoc = gl.getUniformLocation(progbox, "modelview");
        projectionboxLoc = gl.getUniformLocation(progbox, "projection");

        skyboxLoc = gl.getUniformLocation(progbox, "skybox");

        gl.enable(gl.DEPTH_TEST);

        // LOAD SHADER (standard texture mapping)
        var vertexShaderSource = getTextContent("vshader");
        var fragmentShaderSource = getTextContent("fshader");
        prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

        gl.useProgram(prog);

        // locate variables for further use
        CoordsLoc = gl.getAttribLocation(prog, "vcoords");
        NormalLoc = gl.getAttribLocation(prog, "vnormal");
        TexCoordLoc = gl.getAttribLocation(prog, "vtexcoord");

        ModelviewLoc = gl.getUniformLocation(prog, "modelview");
        ProjectionLoc = gl.getUniformLocation(prog, "projection");
        NormalMatrixLoc = gl.getUniformLocation(prog, "normalMatrix");

        textureLoc = gl.getUniformLocation(prog, "texture");
		
        gl.enableVertexAttribArray(CoordsLoc);
        gl.enableVertexAttribArray(NormalLoc);
		gl.enableVertexAttribArray(TexCoordLoc);

        gl.enable(gl.DEPTH_TEST);

		initTexture();  
		
        //  create a "rotator" monitoring mouse mouvement
        rotator = new SimpleRotator(canvas, render);
        //  set initial camera position at z=40, with an "up" vector aligned with y axis
        //   (this defines the initial value of the modelview matrix )
        rotator.setView([0, 0, 1], [0, 1, 0], 40);

        envbox = createModelbox(cube(2500.0));

		gl.uniform4fv(gl.getUniformLocation(prog, "lightPosition"), flatten(lightPosition));

		projection = perspective(70.0, 1.0, 1.0, 10000.0);
		gl.uniformMatrix4fv(ProjectionLoc, false, flatten(projection));  // send projection matrix to the shader program
		
		// In the following lines, we create different "elements" (sphere, cylinder, box, disk,...).
		// These elements are "objects" returned by the "createModel()" function.
		// The "createModel()" function requires one parameter which contains all the information needed
		// to create the "object". The functions "uvSphere()", "uvCylinder()", "cube()",... are described
		// in the file "basic-objects-IFS.js". They return an "object" containing vertices, normals, 
		// texture coordinates and indices.
		// 
		
		
        sphere = createModel(uvSphere(10.0, 25.0, 25.0));
        cylinder = createModel(uvCylinder(10.0, 20.0, 25.0, false, false));
        box = createModel(cube());
        triangularPrism = createModel(uvTriangularPrism());

        teapot = createModel(teapotModel);
        disk = createModel(ring(5.0, 10.0, 25.0));
        torus = createModel(uvTorus(15.0, 5.0, 25.0, 25.0));
        cone = createModel(uvCone(10.0, 20.0, 25.0, true));

		hemisphereinside = createModel(uvHemisphereInside(10.0, 25.0, 25.0));
		hemisphereoutside = createModel(uvHemisphereOutside(10.0, 25.0, 25.0));
        thindisk = createModel(ring(9.5, 10.0, 25.0));

		quartersphereinside = createModel(uvQuartersphereInside(10.0, 25.0, 25.0));
        quartersphereoutside = createModel(uvQuartersphereOutside(10.0, 25.0, 25.0));

        reflectiveBox = createModelmap(cube());
		
		
        //Load environmental mapping shader
        var vertexShaderSourcemap = getTextContent("vshadermap");
        var fragmentShaderSourcemap = getTextContent("fshadermap");
        progmap = createProgram(gl, vertexShaderSourcemap, fragmentShaderSourcemap);

        gl.useProgram(progmap);

        // locate variables for further use
        a_coordsmapLoc = gl.getAttribLocation(progmap, "vcoords");
        a_normalmapLoc = gl.getAttribLocation(progmap, "vnormal");

        u_modelviewmapLoc = gl.getUniformLocation(progmap, "modelview");
        u_projectionmapLoc = gl.getUniformLocation(progmap, "projection");
        u_normalmatrixmapLoc = gl.getUniformLocation(progmap, "normalMatrix");
        u_minvmapLoc = gl.getUniformLocation(progmap, "minv");

        u_skyboxmapLoc = gl.getUniformLocation(progmap, "skybox");

		// managing arrow keys (to move up or down the model)
        document.onkeydown = function (e) {
            switch (e.key) {
                case 'Home':
                    // resize the canvas to the current window width and height
                    resize(canvas);
                    break;
                case 'ArrowUp':
                    // up arrow
                    if (zoffset < 60)
                    zoffset += 5.0;
                    render();
                    break;
                case 'ArrowDown':
                    // down arrow
                    if (zoffset > -450)
                        zoffset -= 5.0;
                    render();
                    break;
                case 'ArrowLeft':
                    // left arrow
                    xoffset += 2.0;
                    render();
                    break;
                case 'ArrowRight':
                    // right arrow
                    xoffset -= 2.0;
                    render();
                    break;
            }
        };

    }
    catch (e) {
        document.getElementById("message").innerHTML =
             "Could not initialize WebGL: " + e;
        return;
    }

    //starwarsARC170 = createModelFromObjFile(ExtractDataFromOBJ("star-wars-arc-170-pbr.obj"));

    spinFunctionCaller = setInterval(spin, 10);
	window.addEventListener("resize", onresize);
	
   	onresize();  // size the canvas to the current window width and height
    render();
}
function spin(){
    thetaPlanets += 0.01;
    render();
}
function onresize() {  // ref. https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
  var realToCSSPixels = window.devicePixelRatio;

  var actualPanelWidth = Math.floor(window.innerWidth * 0.85);  // note that right panel is 85% of window width 
  var actualPanelHeight = Math.floor(window.innerHeight - 30);
  
  var minDimension = Math.min(actualPanelWidth, actualPanelHeight);
    
   // Ajust the canvas to this dimension (square)
    canvas.width  = minDimension;
    canvas.height = minDimension;
	
	gl.viewport(0, 0, canvas.width, canvas.height);
}
function createModelFromObjFile(ptr) {
    
    var i;
    var model = {};
    
    model.numberofelements = ptr.numberofelements;
    model.coordsBuffer = [];
    model.normalBuffer = [];
    model.textureBuffer = [];
    model.indexBuffer = [];
    model.count = [];
    model.Ka = [];
    model.Kd = [];
    model.Ks = [];
    model.Ns = [];
    model.textureFile = [];
    model.texId = [];

    
    for(i=0; i < ptr.numberofelements; i++){
    
        model.coordsBuffer.push( gl.createBuffer() );
        model.normalBuffer.push( gl.createBuffer() );
        model.textureBuffer.push( gl.createBuffer() );
        model.indexBuffer.push( gl.createBuffer() );
        model.count.push( ptr.list[i].indices.length );
    
        gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer[i]);
        gl.bufferData(gl.ARRAY_BUFFER, ptr.list[i].vertexPositions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer[i]);
        gl.bufferData(gl.ARRAY_BUFFER, ptr.list[i].vertexNormals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer[i]);
        gl.bufferData(gl.ARRAY_BUFFER, ptr.list[i].vertexTextureCoords, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer[i]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ptr.list[i].indices, gl.STATIC_DRAW);
        
        model.Ka.push(ptr.list[i].material.Ka);
        model.Kd.push(ptr.list[i].material.Kd);
        model.Ks.push(ptr.list[i].material.Ks);
        model.Ns.push(ptr.list[i].material.Ns);  // shininess
        
        // if a texture file has been defined for this element
        if(ptr.list[i].material.map != ""){
            
            // Check if the filename is present in the texture list
            var texindex = model.textureFile.indexOf(ptr.list[i].material.map);
            if( texindex > -1){ // texture file previously loaded
                // store the texId of the previously loaded file
                model.texId.push(model.texId[texindex]);
            }
            else { // new texture file to load
                // store current texture counter (will be used when rendering the scene)
                model.texId.push(texcounter);
            
                // add a new image buffer to the texture list
                texturelist.push(gl.createTexture());
                if(texcounter < 70){
                    texturelist[texcounter].image = new Image();
                    
                    if(texcounter == 0){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,0)
                        }
                    }
                    else if(texcounter == 1){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,1)
                        }
                    }
                    else if(texcounter == 2){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,2)
                        }
                    }
                    else if(texcounter == 3){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,3)
                        }
                    }
                    else if(texcounter == 4){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,4)
                        }
                    }
                    else if(texcounter == 5){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,5)
                        }
                    }
                    else if(texcounter == 6){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,6)
                        }
                    }
                    else if(texcounter == 7){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,7)
                        }
                    }
                    else if(texcounter == 8){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,8)
                        }
                    }
                    else if(texcounter == 9){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,9)
                        }
                    }
                    else if(texcounter == 10){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,10)
                        }
                    }
                    else if(texcounter == 11){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,11)
                        }
                    }
                    else if(texcounter == 12){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,12)
                        }
                    }
                    else if(texcounter == 13){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,13)
                        }
                    }
                    else if(texcounter == 14){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,14)
                        }
                    }
                    else if(texcounter == 15){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,15)
                        }
                    }
                    else if(texcounter == 16){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,16)
                        }
                    }
                    else if(texcounter == 17){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,17)
                        }
                    }
                    else if(texcounter == 18){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,18)
                        }
                    }
                    else if(texcounter == 19){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,19)
                        }
                    }
                    else if(texcounter == 20){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,20)
                        }
                    }
                    else if(texcounter == 21){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,21)
                        }
                    }
                    else if(texcounter == 22){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,22)
                        }
                    }
                    else if(texcounter == 23){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,23)
                        }
                    }
                    else if(texcounter == 24){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,24)
                        }
                    }
                    else if(texcounter == 25){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,25)
                        }
                    }
                    else if(texcounter == 26){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,26)
                        }
                    }
                    else if(texcounter == 27){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,27)
                        }
                    }
                    else if(texcounter == 28){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,28)
                        }
                    }
                    else if(texcounter == 29){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,29)
                        }
                    }
                    else if(texcounter == 30){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,30)
                        }
                    }
                    else if(texcounter == 31){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,31)
                        }
                    }
                    else if(texcounter == 32){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,32)
                        }
                    }
                    else if(texcounter == 33){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,33)
                        }
                    }
                    else if(texcounter == 34){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,34)
                        }
                    }
                    else if(texcounter == 35){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,35)
                        }
                    }
                    else if(texcounter == 36){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,36)
                        }
                    }
                    else if(texcounter == 37){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,37)
                        }
                    }
                    else if(texcounter == 38){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,38)
                        }
                    }
                    else if(texcounter == 39){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,39)
                        }
                    }
                    else if(texcounter == 40){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,40)
                        }
                    }
                    else if(texcounter == 41){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,41)
                        }
                    }
                    else if(texcounter == 42){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,42)
                        }
                    }
                    else if(texcounter == 43){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,43)
                        }
                    }
                    else if(texcounter == 44){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,44)
                        }
                    }
                    else if(texcounter == 45){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,45)
                        }
                    }
                    else if(texcounter == 46){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,46)
                        }
                    }
                    else if(texcounter == 47){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,47)
                        }
                    }
                    else if(texcounter == 48){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,48)
                        }
                    }
                    else if(texcounter == 49){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,49)
                        }
                    }
                    else if(texcounter == 50){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,50)
                        }
                    }
                    else if(texcounter == 51){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,51)
                        }
                    }
                    else if(texcounter == 52){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,52)
                        }
                    }
                    else if(texcounter == 53){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,53)
                        }
                    }
                    else if(texcounter == 54){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,54)
                        }
                    }
                    else if(texcounter == 55){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,55)
                        }
                    }
                    else if(texcounter == 56){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,56)
                        }
                    }
                    else if(texcounter == 57){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,57)
                        }
                    }
                    else if(texcounter == 58){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,58)
                        }
                    }
                    else if(texcounter == 59){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,59)
                        }
                    }
                    else if(texcounter == 60){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,60)
                        }
                    }
                    else if(texcounter == 61){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,61)
                        }
                    }
                    else if(texcounter == 62){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,62)
                        }
                    }
                    else if(texcounter == 63){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,63)
                        }
                    }
                    else if(texcounter == 64){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,64)
                        }
                    }
                    else if(texcounter == 65){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,65)
                        }
                    }
                    else if(texcounter == 66){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,66)
                        }
                    }
                    else if(texcounter == 67){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,67)
                        }
                    }
                    else if(texcounter == 68){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,68)
                        }
                    }
                    else if(texcounter == 69){  // associate a FIXED callback function to each texture Id
                        texturelist[texcounter].image.onload = function () {
                            handleLoadedTextureFromObjFile(texturelist,69)
                        }
                    }
                    
                    if(texcounter < 70){
                        texturelist[texcounter].image.src = ptr.list[i].material.map;
                        ntextures_tobeloaded++;                 
                    }

                    // increment counter
                    texcounter ++;
                } // if(texcounter<70)
            } // else               
        } // if(ptr.list[i].material.map != ""){
        else { // if there is no texture file associated to this element
            // store a null value (it will NOT be used when rendering the scene)
            model.texId.push(null);
        }
            
        // store the filename for every element even if it is empty ("")
        model.textureFile.push(ptr.list[i].material.map);       
        
    } // for(i=0; i < ptr.numberofelements; i++){
    
    model.render = function () {
        for(i=0; i < this.numberofelements; i++){
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer[i]);
            gl.vertexAttribPointer(CoordsLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer[i]);
            gl.vertexAttribPointer(NormalLoc, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer[i]);
            gl.vertexAttribPointer(TexCoordLoc, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer[i]);

            gl.uniformMatrix4fv(ModelviewLoc, false, flatten(modelview));    //--- load flattened modelview matrix
            gl.uniformMatrix3fv(NormalMatrixLoc, false, flatten(normalMatrix));  //--- load flattened normal matrix

            ambientProduct = mult(lightAmbient, vec4(this.Ka[i],1.0));
            diffuseProduct = mult(lightDiffuse, vec4(this.Kd[i],1.0));
            specularProduct = mult(lightSpecular, vec4(this.Ks[i],1.0));
            materialShininess = this.Ns[i];

            //gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
            //gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
            //gl.uniform4fv(specularProductLoc, flatten(specularProduct));
            //gl.uniform1f(shininessLoc, materialShininess);

            if(this.textureFile[i] != ""){
                gl.enableVertexAttribArray(TexCoordLoc);                
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texturelist[model.texId[i]]);
            
                // Send texture number to sampler
                gl.uniform1i(textureLoc, 0);
                
                // assign "2" to renderingoption in fragment shader
                gl.uniform1i(renderingoptionLoc, 2);
            }
            else{
                gl.disableVertexAttribArray(TexCoordLoc);
                // assign "0" to renderingoption in fragment shader
                gl.uniform1i(renderingoptionLoc, 0);                
            }
            
            gl.drawElements(gl.TRIANGLES, this.count[i], gl.UNSIGNED_SHORT, 0);
        }
    }
    
    return model;
}
function createModelmap(modelData) {
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);

    console.log(modelData.vertexPositions.length);
    console.log(modelData.indices.length);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(a_coordsmapLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_normalmapLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniformMatrix4fv(u_modelviewmapLoc, false, flatten(modelview));    //--- load flattened modelview matrix
        gl.uniformMatrix3fv(u_normalmatrixmapLoc, false, flatten(normalmatrix));  //--- load flattened normal matrix

        gl.uniformMatrix3fv(u_minvmapLoc, false, flatten(minv));  // send matrix inverse of modelview in order to rotate the skybox

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        console.log(this.count);
    }
    return model;
}
