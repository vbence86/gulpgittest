CKEDITOR.editorConfig = function( config ) {
    // Define changes to default configuration here. For example:
    // config.language = 'fr';
    // config.uiColor = '#AADC6E';

    definition = {
        alignment: true,
        images: false,
        lists: false,
        source: false,
        tables: false,
        colors: '292929,ffffff,a2c14b,00b2bb,e5005a,e3e1de',
        fonts: 'Arial;Helvetica;Open Sans',
        fontSizes: '8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;36/36px;48/48px;72/72px'
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

    config.removePlugins = 'elementspath,resize' ; // hide element path and resizer
    config.toolbarCanCollapse = false; // hide toolbar collapse button
    config.extraPlugins = "magnolialink,magnoliaFileBrowser";
    config.toolbar_Magnolia = [
        { name: "basicstyles",   items: [ "Bold", "Italic", "Underline", "Strike", "SpecialChar" ] },
        { name: "paragraph",     items: [ "NumberedList", "BulletedList", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock"] },
        { name: "styles",        items: [ "Font", "FontSize", "TextColor" ] },
        { name: "clipboard",     items: [ "Cut", "Copy", "Paste", "PasteText", "PasteFromWord" ] },
        { name: "undo",          items: [ "Undo", "Redo" ] },
        { name: "button",        items: [ "Button" ] },

    ];

    config.toolbar = "Magnolia";

};