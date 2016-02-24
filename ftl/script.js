$(function() {

  var config = {
    escapeHtml: true,
  };


  /* L20n */

  function update() {
    $("#errors").empty();
    $("#output").empty();

    var args;

    try {
      args = JSON.parse(context.getValue());
    } catch (e) {}

    var code = source.getValue();
    try {
      var entries = IntlMessageFormatParser.parse(code);
    } catch(e) {
      log(e);
    }
    var ctx = new L20n.MockContext(entries);

    for (var id in entries) {
      var val;
      try {
        val = L20n.format(ctx, L20n.lang, args, entries[id])[1];
      } catch (e) {
        $("#output").append(
          "<div><dt><code class=\"disabled\">" + id +
          "</code></dt><dd></dd></div>");
        $("#errors").append(
          "<dt>" + e.name + " in entity <code>" + e.id + 
          "</code></dt><dd>" + escapeHtml(e.message) + "</dd>");
        continue;
      }
      $("#output").append(
        "<div><dt><code>" + id + "</code></dt><dd>" + escapeHtml(val) +
        "</dd></div>");
    }
  }

  /* ACE */

  var source = ace.edit("source");
  source.setShowPrintMargin(false);
  source.setDisplayIndentGuides(false);
  source.getSession().setUseWrapMode(true);
  source.setTheme("ace/theme/solarized_light");
  source.getSession().setMode("ace/mode/properties");
  source.getSession().on('change', update);

  var context = ace.edit("context");
  context.setShowPrintMargin(false);
  context.setHighlightActiveLine(false);
  context.setHighlightGutterLine(false);
  context.setHighlightSelectedWord(false);
  context.getSession().setMode("ace/mode/json");
  context.getSession().on('change', update);


  /* Errors */

  function noop() { }
  function log(e) {
    $("#errors").append(
      "<dt>" + e.name + " near row " + e.line + ", column " + e.column +
      "</dt><dd>" + escapeHtml(e.message) + "</dd>");
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function replaceHtml(char) {
    return entityMap[char];
  }

  function escapeHtml(str) {
    return config.escapeHtml ?
      str.replace(/[&<>"'\/]/g, replaceHtml) : str;
  }


  /* Linkify */

  function utf8_to_b64(str) {
      return window.btoa(unescape(encodeURIComponent(str)));
  }

  function b64_to_utf8(str) {
      return decodeURIComponent(escape(window.atob(str)));
  }

  function linkify() {
    var state = {
      source: source.getValue(),
      context: context.getValue(),
    };
    return window.location.href.split("#")[0] + '#' +
      utf8_to_b64(JSON.stringify(state));
  }


  /* Main Code */

  var hash = window.location.hash.slice(1) || defaultHash;
  var state = JSON.parse(b64_to_utf8(hash));
  context.setValue(state.context);
  source.setValue(state.source);
  source.clearSelection();
  source.gotoLine(0);
  context.clearSelection();

  $('#share').popover({
    placement: 'bottom',
    html: true,
    title: 'Share URL',
    content: '<input id="share-url" type="text">',
  }).click(function() {
    $('#share-url').val(linkify()).focus().select();
    $(this).popover('toggle');
  });

  $('#escape-html').click(function() {
    config.escapeHtml = !config.escapeHtml;
    update();
  });

  window.addEventListener("resize", update);
});
