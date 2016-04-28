CKEDITOR.editorConfig = function( config ) {
    // Define changes to default configuration here. For example:
    // config.language = 'fr';
    // config.uiColor = '#AADC6E';

    definition = {
        alignment: false,
        images: false,
        lists: false,
        source: false,
        tables: false,
        colors: '00b2bb,e5005a',
        fonts: null,
        fontSizes: null
    };

    // MIRROR info.magnolia.ui.form.field.factory.RichTextFieldFactory
    removePlugins = [];

    // CONFIGURATION FROM DEFINITION
    if (!definition.alignment) {
        removePlugins.push("justify");
    }
    if (!definition.images) {
        removePlugins.push("image");
    }
    if (!definition.lists) {
        // In CKEditor 4.1.1 enterkey depends on indent which itself depends on list
        removePlugins.push("enterkey");
        removePlugins.push('indentblock');
        removePlugins.push('indentlist');
        removePlugins.push("indent");
        removePlugins.push("list");

    }
    if (!definition.source) {
        removePlugins.push("sourcearea");
    }
    if (!definition.tables) {
        removePlugins.push("table");
        removePlugins.push("tabletools");
    }

    if (definition.colors != null) {
        config.colorButton_colors = definition.colors;
        config.colorButton_enableMore = false;
        removePlugins.push("colordialog");
    } else {
        removePlugins.push("colorbutton");
        removePlugins.push("colordialog");
    }
    if (definition.fonts != null) {
        config.font_names = definition.fonts;
    } else {
        config.removeButtons = "Font";
    }
    if (definition.fontSizes != null) {
        config.fontSize_sizes = definition.fontSizes;
    } else {
        config.removeButtons = "FontSize";
    }
    if (definition.fonts == null && definition.fontSizes == null) {
        removePlugins.push("font");
        removePlugins.push("fontSize");
    }

    
    config.toolbarCanCollapse = false; // hide toolbar collapse button

    removePlugins.push("elementspath");
    removePlugins.push("filebrowser");
    config.removePlugins = removePlugins.join(",");

    //config.extraPlugins = "magnolialink,magnoliaFileBrowser";

    config.toolbar_Magnolia = [
        { name: "basicstyles",   items: [ "Strike", ] },
        { name: "styles",        items: [ "TextColor" ] },
        { name: "clipboard",     items: [ "Cut", "Copy", "Paste", "PasteText", "PasteFromWord" ] },
        { name: "undo",          items: [ "Undo", "Redo" ] }

    ];

    config.toolbar = "Magnolia";

};