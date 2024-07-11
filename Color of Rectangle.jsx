var doc = app.activeDocument; // the document we are working in
var objects = doc.selection; // select all the objects we are working with

var TEST = objects[0].fillColor.cyan; // test color

if (TEST >= 0) { // if the file is in CMYK format
    var CMYKcolors = []; // an array for storing colors in CMYK
    for (var i = 0; i < objects.length; i++) { // iterate over all objects
        var newCMYKColor = objects[i].fillColor; // save the color of the object

        // round all parameters to integers
        newCMYKColor.cyan = Math.round(newCMYKColor.cyan);
        newCMYKColor.magenta = Math.round(newCMYKColor.magenta);
        newCMYKColor.yellow = Math.round(newCMYKColor.yellow);
        newCMYKColor.black = Math.round(newCMYKColor.black);

        // add the rounded color to the array
        CMYKcolors.push(newCMYKColor);
    }

    var newdoc = app.documents.add(DocumentColorSpace.RGB); // create an auxiliary document with a different color specification
    var artLayer = newdoc.layers[0]; // layer for placing new objects

    for (var i = 0; i < objects.length; i++) {
        var rect = artLayer.pathItems.rectangle(100 * i, 100 * i, 100, 100); // place the rectangle
        rect.fillColor = CMYKcolors[i]; // paint it with CMYK. Since the file is RGB, the color is converted
    }

    var newobjects = artLayer.pathItems; // array of all objects in the layer
    var RGBcolors = []; // array for storing colors in RGB
    for (var i = 0; i < objects.length; i++) {
        var newRGBColor = newobjects[i].fillColor;
        RGBcolors.push(newRGBColor); // add color to the array
    }

    RGBcolors.reverse(); // reverse the array
}

else { // if the file is in RGB format
    var RGBcolors = []; // array for storing colors in RGB
    for (var i = 0; i < objects.length; i++) { // go through all objects
        var newRGBColor = objects[i].fillColor; // save the object color
        RGBcolors.push(newRGBColor); // add to the RGB array
    }

    var newdoc = app.documents.add(DocumentColorSpace.CMYK); // create a helper document with a different color specification
    var artLayer = newdoc.layers[0]; // layer for placing new objects

    for (var i = 0; i < objects.length; i++) {
        var rect = artLayer.pathItems.rectangle(100 * i, 100 * i, 100, 100); // place the rectangle
        rect.fillColor = RGBcolors[i]; // paint it with RGB color. Since the file is CMYK, the color is converted
    }

    var newobjects = artLayer.pathItems; // array of all objects in the layer
    var CMYKcolors = []; // array for storing colors in RGB
    for (var i = 0; i < objects.length; i++) {
        var newCMYKColor = newobjects[i].fillColor;

        // round all parameters to integers
        newCMYKColor.cyan = Math.round(newCMYKColor.cyan);
        newCMYKColor.magenta = Math.round(newCMYKColor.magenta);
        newCMYKColor.yellow = Math.round(newCMYKColor.yellow);
        newCMYKColor.black = Math.round(newCMYKColor.black);

        CMYKcolors.push(newCMYKColor); // add color to array
    }

    CMYKcolors.reverse(); // reverse array
}

var black = new RGBColor; // create black color
black.red = 0; black.green = 0; black.blue = 0;

var white = new RGBColor; // create white color
white.red = 255; white.green = 255; white.blue = 255;

for (var i = 0; i < objects.length; i++) {
// split the RGB color into components
    var RED = Number(RGBcolors[i].red);
    var GREEN = Number(RGBcolors[i].green);
    var BLUE = Number(RGBcolors[i].blue);

    var yiq = ((RED*299)+(GREEN*587)+(BLUE*114))/1000; // variable for determining contrast

    var myTextFrame = doc.textFrames.add(); // create a text field

    myTextFrame.contents = "RGB "+RED+" "+GREEN+" "+BLUE+"\n"+ // output RGB
        "CMYK "+CMYKcolors[i].cyan+" "+CMYKcolors[i].magenta+" "+CMYKcolors[i].yellow+" "+CMYKcolors[i].black+"\n"+ // output CMYK
        "HEX "+(componentToHex(RED)+componentToHex(GREEN)+componentToHex(BLUE)).toUpperCase(); // output HEX

// create a text style
    var charStyle = doc.characterStyles.add("new");
    var charAttr = charStyle.characterAttributes;

    charAttr.size = Number(Math.round(objects[i].height/6)); // font size is one sixth of the rectangle's height
    charAttr.fillColor = (yiq >= 128) ? black : white; // text fill

    charStyle.applyTo(myTextFrame.textRange); // apply style to text
    myTextFrame.position = [objects[i].left+charAttr.size*2/3, objects[i].top-objects[i].height/3]; // set the text field position

    charStyle.remove(); // remove the used style
}

newdoc.close(SaveOptions.DONOTSAVECHANGES); // close the auxiliary file without saving

function componentToHex(c) { // separate function for converting the RGB part of the color to HEX
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}