/* @ds-bundle: {"format":4,"namespace":"CodemixDesignSystem_95bbea","components":[{"name":"BulletList","sourcePath":"components/content/BulletList.jsx"},{"name":"MediaLinkList","sourcePath":"components/content/MediaLinkList.jsx"},{"name":"ProductThumb","sourcePath":"components/content/ProductThumb.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"LinkArrow","sourcePath":"components/core/LinkArrow.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"SectionHeading","sourcePath":"components/core/SectionHeading.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"HighlightBar","sourcePath":"components/layout/HighlightBar.jsx"},{"name":"NavTabs","sourcePath":"components/layout/NavTabs.jsx"},{"name":"Panel","sourcePath":"components/layout/Panel.jsx"}],"sourceHashes":{"components/content/BulletList.jsx":"5ea641b3d19b","components/content/MediaLinkList.jsx":"7de0c5f3bbe9","components/content/ProductThumb.jsx":"6f35db8d9a37","components/core/Badge.jsx":"543697c03743","components/core/Button.jsx":"42a5879b053f","components/core/LinkArrow.jsx":"70c3e422b80c","components/core/Logo.jsx":"2b0dc4087212","components/core/SectionHeading.jsx":"67ff7aec9bdd","components/forms/Checkbox.jsx":"d2c10024ca3e","components/forms/Field.jsx":"473debc6277d","components/forms/Input.jsx":"b3e5d13afaeb","components/forms/Select.jsx":"1009db319570","components/forms/Textarea.jsx":"5f9bb67bba5f","components/layout/HighlightBar.jsx":"a51beaf0ff99","components/layout/NavTabs.jsx":"1a4c068c7e14","components/layout/Panel.jsx":"2ec95fccf690","ui_kits/brand-banner/BannerSquare.jsx":"b1dfe739f582","ui_kits/brand-banner/BannerWide.jsx":"ee8a0eb1f823","ui_kits/codemix-web/AsidePitch.jsx":"4753006ec2b1","ui_kits/codemix-web/ContactScreen.jsx":"a25702c7fe04","ui_kits/codemix-web/HeroBand.jsx":"a7a1c20336e9","ui_kits/codemix-web/HomeScreen.jsx":"ccc50312cf18","ui_kits/codemix-web/ProductsScreen.jsx":"7fa83ca27d59","ui_kits/codemix-web/SiteChrome.jsx":"ba8ac7270ad4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CodemixDesignSystem_95bbea = window.CodemixDesignSystem_95bbea || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/content/BulletList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function BulletList({
  items = [],
  tone = "dark",
  style,
  ...rest
}) {
  const dark = tone === "dark";
  return /*#__PURE__*/React.createElement("ul", _extends({
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: "var(--space-4)",
      ...style
    }
  }, rest), items.map((t, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "14px 1fr",
      gap: "var(--space-4)",
      font: "var(--type-body)",
      color: dark ? "var(--text-on-dark-muted)" : "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: "var(--amber-400)",
      fontSize: "16px",
      lineHeight: 1.35,
      textAlign: "center"
    }
  }, "\u2022"), /*#__PURE__*/React.createElement("span", null, t))));
}
Object.assign(__ds_scope, { BulletList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/BulletList.jsx", error: String((e && e.message) || e) }); }

// components/content/MediaLinkList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const codemixMediaKindLabel = {
  video: "video",
  flash: "apresentação",
  jpg: "screenshot",
  doc: "documento"
};
function MediaLinkList({
  items = [],
  tone = "light",
  style,
  ...rest
}) {
  const dark = tone === "dark";
  return /*#__PURE__*/React.createElement("ul", _extends({
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      ...style
    }
  }, rest), items.map((it, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      borderTop: i ? "1px solid " + (dark ? "var(--border-on-dark)" : "var(--border-subtle)") : "none"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: it.href || "#",
    style: {
      display: "grid",
      gridTemplateColumns: "26px 1fr",
      alignItems: "center",
      gap: "var(--space-5)",
      padding: "var(--space-5) var(--space-4)",
      textDecoration: "none",
      color: dark ? "var(--text-on-dark)" : "var(--text-body)",
      font: "var(--type-body)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: "22px",
      height: "22px",
      borderRadius: "var(--radius-xs)",
      background: dark ? "rgba(255,255,255,.10)" : "var(--neutral-300)",
      color: dark ? "var(--amber-400)" : "var(--graphite-800)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      font: "var(--fw-medium) 9px/1 var(--font-display)",
      textTransform: "uppercase",
      letterSpacing: ".04em"
    }
  }, it.kind === "video" ? "\u25B6" : it.kind === "jpg" ? "JPG" : it.kind === "flash" ? "SWF" : "DOC"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: "var(--fw-medium)"
    }
  }, it.label), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, it.meta || codemixMediaKindLabel[it.kind] || ""))))));
}
Object.assign(__ds_scope, { MediaLinkList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/MediaLinkList.jsx", error: String((e && e.message) || e) }); }

// components/content/ProductThumb.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProductThumb({
  src,
  alt = "",
  width = 180,
  height = 100,
  caption,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("figure", _extends({
    style: {
      margin: 0,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: width + "px",
      height: height + "px",
      background: "var(--neutral-000)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-card)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      maxWidth: "84%",
      maxHeight: "78%",
      objectFit: "contain",
      display: "block"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--fs-caption)/1.3 var(--font-sans)",
      color: "var(--neutral-500)"
    }
  }, "logo do produto")), caption && /*#__PURE__*/React.createElement("figcaption", {
    style: {
      marginTop: "var(--space-4)",
      font: "var(--fw-regular) var(--fs-caption)/1.3 var(--font-sans)",
      color: "var(--text-muted)"
    }
  }, caption));
}
Object.assign(__ds_scope, { ProductThumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ProductThumb.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const codemixBadgeBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  height: "20px",
  padding: "0 var(--space-5)",
  borderRadius: "var(--radius-pill)",
  font: "var(--fw-semibold) var(--fs-caption)/1 var(--font-display)",
  letterSpacing: "var(--ls-kicker)",
  textTransform: "uppercase",
  whiteSpace: "nowrap"
};
const codemixBadgeTones = {
  brand: {
    background: "var(--grad-brand)",
    color: "var(--charcoal-900)"
  },
  outline: {
    background: "transparent",
    color: "var(--text-accent)",
    boxShadow: "inset 0 0 0 1px var(--orange-500)"
  },
  neutral: {
    background: "var(--neutral-300)",
    color: "var(--graphite-800)"
  },
  dark: {
    background: "var(--charcoal-900)",
    color: "var(--amber-400)"
  }
};
function Badge({
  children,
  tone = "brand",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      ...codemixBadgeBase,
      ...(codemixBadgeTones[tone] || codemixBadgeTones.brand),
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const codemixButtonBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0",
  font: "var(--fw-medium) var(--fs-body)/1 var(--font-sans)",
  letterSpacing: "var(--ls-nav)",
  borderRadius: "var(--radius-sm)",
  border: "1px solid",
  cursor: "pointer",
  padding: "0",
  overflow: "hidden",
  transition: "var(--transition-control)",
  userSelect: "none",
  textDecoration: "none"
};
const codemixButtonSizes = {
  sm: {
    height: "var(--control-h-sm)",
    pad: "0 var(--space-5)",
    fs: "var(--fs-body-sm)"
  },
  md: {
    height: "var(--control-h)",
    pad: "0 var(--space-7)",
    fs: "var(--fs-body)"
  },
  lg: {
    height: "42px",
    pad: "0 var(--space-9)",
    fs: "var(--fs-body-lg)"
  }
};
const codemixButtonVariants = {
  primary: {
    background: "var(--grad-brand)",
    borderColor: "var(--orange-700)",
    color: "#fff",
    textShadow: "0 1px 1px rgba(0,0,0,.35)",
    boxShadow: "var(--shadow-button)"
  },
  secondary: {
    background: "linear-gradient(180deg,#fdfdfd 0%,#e9e9e9 100%)",
    borderColor: "var(--border-strong)",
    color: "var(--text-body)",
    boxShadow: "var(--shadow-button)"
  },
  dark: {
    background: "linear-gradient(180deg,var(--slate-600) 0%,var(--graphite-800) 100%)",
    borderColor: "#2b2b2b",
    color: "var(--text-on-dark)",
    boxShadow: "var(--shadow-button)"
  },
  ghost: {
    background: "transparent",
    borderColor: "transparent",
    color: "var(--link)",
    boxShadow: "none"
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  disabled = false,
  href,
  icon,
  onClick,
  style,
  ...rest
}) {
  const s = codemixButtonSizes[size] || codemixButtonSizes.md;
  const v = codemixButtonVariants[variant] || codemixButtonVariants.primary;
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: onClick,
    disabled: Tag === "button" ? disabled : undefined,
    style: {
      ...codemixButtonBase,
      ...v,
      height: s.height,
      fontSize: s.fs,
      opacity: disabled ? .45 : 1,
      pointerEvents: disabled ? "none" : "auto",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: s.pad,
      height: "100%"
    }
  }, icon, children), arrow && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "26px",
      borderLeft: "1px solid rgba(0,0,0,.22)",
      boxShadow: "inset 1px 0 0 rgba(255,255,255,.28)",
      fontSize: "11px"
    }
  }, "\u25B8"));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/LinkArrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const codemixLinkArrowStyle = {
  font: "var(--fw-regular) var(--fs-body-lg)/1.3 var(--font-sans)",
  color: "var(--link)",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "baseline",
  gap: "var(--space-3)",
  transition: "var(--transition-control)"
};
function LinkArrow({
  children,
  href = "#",
  glyph = "\u00BB",
  tone = "accent",
  onClick,
  style,
  ...rest
}) {
  const color = tone === "accent" ? "var(--link)" : tone === "onDark" ? "var(--text-on-dark)" : "var(--text-body)";
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onClick: onClick,
    style: {
      ...codemixLinkArrowStyle,
      color,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", null, children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontSize: ".9em"
    }
  }, glyph));
}
Object.assign(__ds_scope, { LinkArrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/LinkArrow.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const codemixLogoSrc = {
  color: "assets/logo-codemix-color.png",
  white: "assets/logo-codemix-white.svg",
  dark: "assets/logo-codemix-dark.png",
  mark: "assets/mark-codemix-color.png"
};
function Logo({
  variant = "color",
  height = 40,
  assetBase = "",
  tagline,
  style,
  ...rest
}) {
  const src = (assetBase || "") + (codemixLogoSrc[variant] || codemixLogoSrc.color);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "flex-end",
      gap: "var(--space-6)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "codemix",
    style: {
      height: height + "px",
      width: "auto",
      display: "block"
    }
  }), tagline && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-light) var(--fs-body-sm)/1.3 var(--font-sans)",
      color: "var(--text-on-dark-muted)",
      paddingBottom: "2px"
    }
  }, tagline));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SectionHeading({
  lead,
  children,
  kicker,
  sub,
  tone = "light",
  align = "left",
  size = "md",
  style,
  ...rest
}) {
  const onDark = tone === "dark";
  const fs = size === "lg" ? "var(--fs-title-lg)" : size === "sm" ? "var(--fs-title-sm)" : "var(--fs-title-md)";
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      textAlign: align,
      ...style
    }
  }, rest), kicker && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--ls-kicker)",
      textTransform: "uppercase",
      color: "var(--text-accent)",
      marginBottom: "var(--space-3)"
    }
  }, kicker), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: "var(--fw-light) " + fs + "/var(--lh-heading) var(--font-sans)",
      color: onDark ? "var(--text-on-dark)" : "var(--text-heading)"
    }
  }, lead && /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: "var(--fw-medium)"
    }
  }, lead, " "), children), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-3) 0 0",
      font: "var(--type-body)",
      color: onDark ? "var(--text-on-dark-muted)" : "var(--text-muted)"
    }
  }, sub));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-5)",
      font: "var(--type-body)",
      color: "var(--text-body)",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? .5 : 1,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: "16px",
      height: "16px",
      borderRadius: "var(--radius-xs)",
      border: "1px solid " + (checked ? "var(--orange-700)" : "var(--border-strong)"),
      background: checked ? "var(--grad-brand)" : "linear-gradient(180deg,#fff 0%,#f0f0f0 100%)",
      boxShadow: "var(--shadow-inset-field)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "11px",
      lineHeight: 1
    }
  }, checked ? "\u2713" : ""), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Field({
  label,
  children,
  layout = "row",
  hint,
  required = false,
  style,
  ...rest
}) {
  const row = layout === "row";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: row ? "grid" : "block",
      gridTemplateColumns: row ? "92px 1fr" : undefined,
      alignItems: "center",
      gap: row ? "var(--space-6)" : undefined,
      marginBottom: "var(--space-5)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("label", {
    style: {
      font: "var(--fw-regular) var(--fs-body-lg)/1.2 var(--font-sans)",
      color: "var(--text-muted)",
      display: "block",
      marginBottom: row ? 0 : "var(--space-3)",
      textAlign: row ? "left" : "left"
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-accent)"
    }
  }, " *")), /*#__PURE__*/React.createElement("div", null, children, hint && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-regular) var(--fs-caption)/1.4 var(--font-sans)",
      color: "var(--text-muted)",
      marginTop: "var(--space-3)"
    }
  }, hint)));
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const codemixInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  height: "var(--control-h)",
  padding: "0 var(--space-5)",
  font: "var(--type-body)",
  color: "var(--text-body)",
  background: "var(--neutral-000)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-inset-field)",
  outline: "none",
  transition: "var(--transition-control)"
};
function Input({
  invalid = false,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("input", _extends({
    disabled: disabled,
    style: {
      ...codemixInputStyle,
      borderColor: invalid ? "var(--danger-500)" : "var(--border-subtle)",
      background: disabled ? "var(--neutral-100)" : "var(--neutral-000)",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const codemixSelectStyle = {
  width: "100%",
  boxSizing: "border-box",
  height: "var(--control-h)",
  padding: "0 var(--space-5)",
  font: "var(--type-body)",
  color: "var(--text-body)",
  background: "var(--neutral-000)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-inset-field)",
  outline: "none",
  transition: "var(--transition-control)"
};
function Select({
  options = [],
  placeholder,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("select", _extends({
    style: {
      ...codemixSelectStyle,
      appearance: "none",
      backgroundImage: "linear-gradient(180deg,#fff 0%,#f2f2f2 100%)",
      paddingRight: "var(--space-9)",
      ...style
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => typeof o === "string" ? /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const codemixTextareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: "120px",
  padding: "var(--space-5)",
  font: "var(--type-body)",
  color: "var(--text-body)",
  background: "var(--neutral-000)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-inset-field)",
  outline: "none",
  resize: "vertical"
};
function Textarea({
  rows = 6,
  invalid = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    style: {
      ...codemixTextareaStyle,
      borderColor: invalid ? "var(--danger-500)" : "var(--border-subtle)",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/layout/HighlightBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function HighlightBar({
  children,
  right,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-7)",
      minHeight: "var(--row-highlight)",
      padding: "0 var(--space-8)",
      background: "var(--grad-highlight-bar)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.4),0 1px 3px rgba(0,0,0,.25)",
      font: "var(--fw-regular) var(--fs-body-sm)/1 var(--font-sans)",
      color: "var(--text-on-highlight)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)"
    }
  }, children), right && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "rgba(43,43,43,.45)",
      font: "var(--fw-regular) var(--fs-body-sm)/1 var(--font-sans)"
    }
  }, right));
}
Object.assign(__ds_scope, { HighlightBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/HighlightBar.jsx", error: String((e && e.message) || e) }); }

// components/layout/NavTabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function NavTabs({
  items = [],
  active,
  onSelect,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 0,
      height: "var(--row-nav)",
      background: "linear-gradient(180deg,#3a3f42 0%,#2f3436 100%)",
      borderTop: "1px solid rgba(255,255,255,.08)",
      ...style
    }
  }, rest), items.map((it, i) => {
    const label = typeof it === "string" ? it : it.label;
    const on = (active ?? items[0]) === label || active === (typeof it === "string" ? it : it.value);
    return /*#__PURE__*/React.createElement("button", {
      key: label,
      onClick: () => onSelect && onSelect(label),
      style: {
        appearance: "none",
        border: 0,
        cursor: "pointer",
        height: on ? "var(--row-nav)" : "calc(var(--row-nav) - 2px)",
        padding: "0 var(--space-7)",
        font: "var(--type-nav)",
        letterSpacing: "var(--ls-nav)",
        color: on ? "var(--charcoal-900)" : "#d7d8da",
        background: on ? "var(--grad-highlight-bar)" : "transparent",
        borderTopLeftRadius: "var(--radius-sm)",
        borderTopRightRadius: "var(--radius-sm)",
        borderRight: on ? "none" : "1px solid rgba(255,255,255,.08)",
        transition: "var(--transition-control)"
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { NavTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/NavTabs.jsx", error: String((e && e.message) || e) }); }

// components/layout/Panel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Panel({
  title,
  titleLead,
  subtitle,
  children,
  tone = "light",
  padding = "var(--space-7)",
  style,
  ...rest
}) {
  const dark = tone === "dark";
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: dark ? "var(--surface-card-dark)" : "var(--surface-card)",
      border: "1px solid " + (dark ? "var(--border-on-dark)" : "var(--border-subtle)"),
      borderRadius: "var(--radius-md)",
      boxShadow: dark ? "none" : "var(--shadow-card)",
      overflow: "hidden",
      ...style
    }
  }, rest), (title || subtitle) && /*#__PURE__*/React.createElement("header", {
    style: {
      padding: "var(--space-6) " + padding + " var(--space-5)",
      background: dark ? "linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,0) 100%)" : "linear-gradient(180deg,#f2f2f2 0%,#fbfbfb 100%)",
      borderBottom: "1px solid " + (dark ? "var(--border-on-dark)" : "var(--border-subtle)")
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: "var(--fw-light) var(--fs-title-md)/1.1 var(--font-sans)",
      color: dark ? "var(--text-on-dark)" : "var(--text-heading)"
    }
  }, titleLead && /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: "var(--fw-medium)"
    }
  }, titleLead, " "), title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-2)",
      font: "var(--fw-regular) var(--fs-body-sm)/1.3 var(--font-sans)",
      color: dark ? "var(--text-on-dark-muted)" : "var(--text-muted)"
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding
    }
  }, children));
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/brand-banner/BannerSquare.jsx
try { (() => {
function BannerSquare({
  kicker = "desenvolvo seu produto com",
  headline = "Agentes e automações IA",
  services = "ui/ux design . desenvolvimento . seo e geo",
  size = 560
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: size + "px",
      height: size + "px",
      background: "var(--charcoal-900)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark-codemix-color.png",
    alt: "",
    style: {
      position: "absolute",
      left: "-40px",
      bottom: "-60px",
      height: "330px",
      filter: "grayscale(1) brightness(2.4)",
      opacity: .055
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-codemix-white.svg",
    alt: "codemix",
    style: {
      position: "absolute",
      left: "40px",
      top: "36px",
      height: "40px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "40px",
      right: "40px",
      top: "170px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-semibold) 18px/1 var(--font-display)",
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "var(--amber-400)"
    }
  }, kicker), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "8px",
      font: "var(--fw-bold) 56px/1.02 var(--font-display)",
      textTransform: "uppercase",
      color: "#fefefe"
    }
  }, headline), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "16px",
      font: "var(--fw-regular) 17px/1.35 var(--font-display)",
      letterSpacing: ".06em",
      textTransform: "uppercase",
      color: "#8a8a8a"
    }
  }, services)));
}
Object.assign(window, {
  BannerSquare
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/brand-banner/BannerSquare.jsx", error: String((e && e.message) || e) }); }

// ui_kits/brand-banner/BannerWide.jsx
try { (() => {
function BannerWide({
  kicker = "desenvolvo seu produto com",
  headline = "Agentes e automações IA",
  services = "ui/ux design . desenvolvimento . seo e geo",
  stack = "typescript . n8n . supabase",
  width = 1584,
  height = 396
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: width + "px",
      height: height + "px",
      background: "var(--charcoal-900)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark-codemix-color.png",
    alt: "",
    style: {
      position: "absolute",
      left: "14px",
      top: "148px",
      height: "286px",
      filter: "grayscale(1) brightness(2.4)",
      opacity: .055
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-codemix-white.svg",
    alt: "codemix",
    style: {
      position: "absolute",
      left: "42px",
      top: "40px",
      height: "52px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: "52px",
      top: "58px",
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-semibold) 26px/1 var(--font-display)",
      letterSpacing: ".05em",
      textTransform: "uppercase",
      color: "var(--amber-400)"
    }
  }, kicker), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "10px",
      font: "var(--fw-bold) 72px/1 var(--font-display)",
      letterSpacing: ".01em",
      textTransform: "uppercase",
      color: "#fefefe"
    }
  }, headline), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "18px",
      font: "var(--fw-regular) 27px/1.2 var(--font-display)",
      letterSpacing: ".05em",
      textTransform: "uppercase",
      color: "#8a8a8a"
    }
  }, services), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "6px",
      font: "var(--fw-regular) 27px/1.2 var(--font-display)",
      letterSpacing: ".05em",
      textTransform: "uppercase",
      color: "#494949"
    }
  }, stack)));
}
Object.assign(window, {
  BannerWide
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/brand-banner/BannerWide.jsx", error: String((e && e.message) || e) }); }

// ui_kits/codemix-web/AsidePitch.jsx
try { (() => {
function AsidePitch() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-codemix-dark.png",
    alt: "codemix",
    style: {
      height: "18px",
      opacity: .85
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-light) var(--fs-body-lg)/1 var(--font-sans)",
      color: "var(--text-muted)"
    }
  }, ". development solutions")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-5) 0 0",
      font: "var(--fw-regular) var(--fs-body-sm)/1.55 var(--font-sans)",
      color: "var(--text-body)"
    }
  }, "Vendemos solu\xE7\xF5es para problemas de organiza\xE7\xE3o, comunica\xE7\xE3o, produ\xE7\xE3o, estrat\xE9gia e marketing para empresas que seguem os avan\xE7os tecnol\xF3gicos e log\xEDsticos."));
}
Object.assign(window, {
  AsidePitch
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/codemix-web/AsidePitch.jsx", error: String((e && e.message) || e) }); }

// ui_kits/codemix-web/ContactScreen.jsx
try { (() => {
const {
  SectionHeading,
  LinkArrow,
  Panel,
  Field,
  Input,
  Textarea,
  Button,
  MediaLinkList
} = window.CodemixDesignSystem_95bbea;
function ContactScreen() {
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-9) var(--container-gutter) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 288px",
      gap: "var(--space-10)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    lead: "Fale conosco",
    size: "lg",
    sub: "Encontre a solu\xE7\xE3o ideal para a sua empresa"
  }, "e tire todas as suas d\xFAvidas sobre os gerenciadores."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-5) 0 var(--space-9)"
    }
  }, /*#__PURE__*/React.createElement(LinkArrow, null, "Consulte nossos planos")), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      maxWidth: "600px"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nome"
  }, /*#__PURE__*/React.createElement(Input, {
    required: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Email"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "email",
    required: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Tel"
  }, /*#__PURE__*/React.createElement(Input, null)), /*#__PURE__*/React.createElement(Field, {
    label: "Assunto"
  }, /*#__PURE__*/React.createElement(Input, null)), /*#__PURE__*/React.createElement(Field, {
    label: "Msg"
  }, /*#__PURE__*/React.createElement(Textarea, {
    rows: 7
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-7)",
      paddingLeft: "104px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    arrow: true,
    type: "submit"
  }, "enviar"), sent && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body)",
      color: "var(--success-500)"
    }
  }, "Mensagem enviada. Responderemos em breve.")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(AsidePitch, null), /*#__PURE__*/React.createElement(Panel, {
    titleLead: "Flash",
    title: "tutoriais",
    padding: "var(--space-4)"
  }, /*#__PURE__*/React.createElement(MediaLinkList, {
    items: [{
      label: "UtJuris",
      meta: "",
      kind: "flash"
    }, {
      label: "E-agency",
      meta: "",
      kind: "flash"
    }, {
      label: "Mapa de Imóveis",
      meta: "",
      kind: "flash"
    }, {
      label: "Codemix",
      meta: "",
      kind: "flash"
    }]
  })), /*#__PURE__*/React.createElement(Panel, {
    titleLead: "Imagens",
    title: "software",
    padding: "var(--space-6)"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-sans)",
      color: "var(--text-muted)"
    }
  }, "Telas dos gerenciadores em alta resolu\xE7\xE3o.")))));
}
Object.assign(window, {
  ContactScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/codemix-web/ContactScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/codemix-web/HeroBand.jsx
try { (() => {
const {
  BulletList,
  Button
} = window.CodemixDesignSystem_95bbea;
function HeroBand() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--grad-chrome)",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(90% 120% at 40% 20%,rgba(255,255,255,.05) 0%,rgba(255,255,255,0) 60%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "0 var(--container-gutter)",
      display: "grid",
      gridTemplateColumns: "1fr 306px",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "270px 1fr",
      alignItems: "center",
      gap: "var(--space-6)",
      padding: "var(--space-7) 0"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/hero-stack.png",
    alt: "Telas dos gerenciadores codemix",
    style: {
      width: "270px",
      display: "block",
      mixBlendMode: "lighten"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--fw-light) 21px/1.35 var(--font-sans)",
      color: "var(--text-on-dark-muted)"
    }
  }, "Simplesmente,"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-3) 0 var(--space-7)",
      font: "var(--fw-light) 21px/1.35 var(--font-sans)",
      color: "var(--text-on-dark)"
    }
  }, "as ferramentas mais poderosas", /*#__PURE__*/React.createElement("br", null), "de gerenciamento de conte\xFAdo na internet."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    arrow: true
  }, "saiba mais"))), /*#__PURE__*/React.createElement("aside", {
    style: {
      background: "rgba(255,255,255,.04)",
      borderLeft: "1px solid var(--border-on-dark)",
      padding: "var(--space-7) var(--space-8)",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: "var(--fw-regular) 19px/1.2 var(--font-sans)",
      letterSpacing: ".02em",
      textTransform: "uppercase",
      color: "var(--amber-400)"
    }
  }, "Conhe\xE7a as vantagens"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-3) 0 var(--space-6)",
      font: "var(--fw-light) var(--fs-body-lg)/1.35 var(--font-sans)",
      color: "var(--text-on-dark)"
    }
  }, "de ter o controle total sobre o seu site, loja virtual, ag\xEAncia, rede social\u2026"), /*#__PURE__*/React.createElement(BulletList, {
    items: ["Atualize conteúdos de qualquer computador", "Insira fotos, vídeos, arquivos, músicas", "Confira os acessos, organize os usuários", "Relatórios completos sobre o tráfego", "Design personalizado à sua atividade", "Suporte e treinamento completos"]
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-codemix-white.png",
    alt: "",
    style: {
      position: "absolute",
      right: "18px",
      bottom: "14px",
      height: "26px",
      opacity: .9,
      objectFit: "none",
      objectPosition: "right",
      width: "30px"
    }
  }))));
}
Object.assign(window, {
  HeroBand
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/codemix-web/HeroBand.jsx", error: String((e && e.message) || e) }); }

// ui_kits/codemix-web/HomeScreen.jsx
try { (() => {
const {
  SectionHeading,
  LinkArrow,
  Panel,
  MediaLinkList
} = window.CodemixDesignSystem_95bbea;
function ProductRow({
  logo,
  alt,
  title,
  children,
  last
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "196px 1fr",
      gap: "var(--space-6)",
      padding: "var(--space-7) 0",
      borderBottom: last ? "none" : "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: logo,
    alt: alt,
    style: {
      width: "178px",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-4)",
      marginTop: "var(--space-5)",
      textDecoration: "none",
      font: "var(--type-body)",
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "15px",
      height: "15px",
      borderRadius: "var(--radius-pill)",
      background: "var(--grad-brand)",
      color: "#fff",
      font: "var(--fw-medium) 11px/15px var(--font-sans)",
      textAlign: "center"
    }
  }, "+"), "Saiba mais")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 var(--space-4)",
      font: "var(--fw-regular) var(--fs-title-sm)/1.2 var(--font-sans)",
      color: "var(--text-heading)"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--fw-regular) var(--fs-body-sm)/1.55 var(--font-sans)",
      color: "var(--text-body)"
    }
  }, children)));
}
function HomeScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-9) var(--container-gutter) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 288px",
      gap: "var(--space-10)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    lead: "Assine j\xE1",
    size: "lg",
    sub: "Tudo \xE9 feito de forma virtual, n\xE3o sendo necess\xE1rio instalar nada!"
  }, "um dos nossos servi\xE7os e comece a utilizar os softwares agora!"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-6) 0 var(--space-9)",
      font: "var(--fw-regular) var(--fs-body-lg)/1.5 var(--font-sans)"
    }
  }, "Temos a solu\xE7\xE3o ideal para a sua empresa. ", /*#__PURE__*/React.createElement(LinkArrow, null, "Consulte nossos planos")), /*#__PURE__*/React.createElement(Panel, {
    titleLead: "\xFAltimos",
    title: "lan\xE7amentos",
    subtitle: "softwares gerenciadores",
    padding: "var(--space-8)"
  }, /*#__PURE__*/React.createElement(ProductRow, {
    logo: "../../assets/produto-eagency.png",
    alt: "e:agency",
    title: "e:agency . design, publicidade e web."
  }, "Ag\xEAncias de cria\xE7\xE3o, tanto web quanto gr\xE1fica, que necessitam de um produto que gerencie o relacionamento com o atendente e os projetos que devem ser executados de maneira simples e f\xE1cil."), /*#__PURE__*/React.createElement(ProductRow, {
    logo: "../../assets/produto-eumobilien.png",
    alt: "eumobilien",
    title: "eumobilien . mapa de im\xF3veis na Europa",
    last: true
  }, "Com as portas e os olhos abertos para o mercado exterior, o sistema de im\xF3veis eumobilien pretende catalogar im\xF3veis na Europa e compartilhar com as Imobili\xE1rias e Corretores de Im\xF3veis Europeus."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(AsidePitch, null), /*#__PURE__*/React.createElement(Panel, {
    titleLead: "cases",
    title: "de sucesso",
    subtitle: "clientes e resultados",
    padding: "var(--space-7)"
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: "0 0 var(--space-4)",
      font: "var(--fw-regular) var(--fs-title-sm)/1.2 var(--font-sans)"
    }
  }, "UtJuris - rede social jur\xEDdica"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 var(--space-6)",
      font: "var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-sans)"
    }
  }, "Rede social jur\xEDdica com \xEDndice do Direito brasileiro, v\xEDdeos e textos."), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/case-utjuris-screen.png",
    alt: "UtJuris",
    style: {
      width: "100%",
      display: "block",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)"
    }
  })), /*#__PURE__*/React.createElement(Panel, {
    titleLead: "layouts",
    title: "customiz\xE1veis",
    subtitle: "edite estilos",
    padding: "var(--space-4)"
  }, /*#__PURE__*/React.createElement(MediaLinkList, {
    items: [{
      label: "video",
      meta: "media player",
      kind: "video"
    }, {
      label: "apresentação",
      meta: "flash",
      kind: "flash"
    }, {
      label: "screenshot",
      meta: "telas",
      kind: "jpg"
    }]
  })))));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/codemix-web/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/codemix-web/ProductsScreen.jsx
try { (() => {
const {
  SectionHeading,
  LinkArrow,
  Panel,
  MediaLinkList
} = window.CodemixDesignSystem_95bbea;
function ProductsScreen() {
  const tutoriais = ["Gerenciamento de Clientes", "Gerenciamento de Processos", "Gerenciamento de Advogados", "Gerenciamento de Categorias", "Gerenciamento de Conteúdos", "Gerenciamento de Arquivos", "Gerenciamento de SEO"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-9) var(--container-gutter) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 288px",
      gap: "var(--space-10)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    lead: "Conhe\xE7a",
    size: "lg",
    sub: "Encontre a solu\xE7\xE3o ideal para a sua empresa"
  }, "a nossa linha de gerenciadores de conte\xFAdo"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-5) 0 var(--space-9)"
    }
  }, /*#__PURE__*/React.createElement(LinkArrow, null, "Consulte nossos planos")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "196px 1fr",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/produto-utjuris.png",
    alt: "UtJuris",
    style: {
      width: "176px",
      display: "block",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
      background: "#fff"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)",
      background: "linear-gradient(180deg,#f4f4f4 0%,#e4e4e4 100%)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(MediaLinkList, {
    items: [{
      label: "video",
      meta: "media player",
      kind: "video"
    }, {
      label: "apresentação",
      meta: "flash",
      kind: "flash"
    }, {
      label: "screenshot",
      meta: "telas",
      kind: "jpg"
    }]
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 var(--space-5)",
      font: "var(--fw-regular) var(--fs-title-sm)/1.2 var(--font-sans)"
    }
  }, "Rede Social Jur\xEDdica . UtJuris"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 var(--space-5)",
      font: "var(--fw-regular) var(--fs-body-sm)/1.55 var(--font-sans)"
    }
  }, "Rede social criada em novembro de 2008 com a inten\xE7\xE3o de unificar a informa\xE7\xE3o jur\xEDdica brasileira na internet, progressivamente todo o conte\xFAdo est\xE1 sendo inserido por n\xF3s e pelos usu\xE1rios que j\xE1 est\xE3o registrados."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--fw-regular) var(--fs-body-sm)/1.55 var(--font-sans)"
    }
  }, "Voc\xEA encontra atualmente no UtJuris, \xE1udio, v\xEDdeo e textos sobre Direito, Legisla\xE7\xE3o, estamos construindo um index do Direito na internet pra facilitar a procura na internet de assunto relacionado, temos um sistema de busca espec\xEDfica do Direito, barra de ferramentas, informa\xE7\xF5es e not\xEDcias via RSS."))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-9) 0 0",
      font: "var(--fw-regular) var(--fs-body-sm)/1.55 var(--font-sans)"
    }
  }, "O cotidiano no trabalho dos profissionais do Direito mudou muito nos \xFAltimos anos, como por exemplo o acompanhamento processual e a peti\xE7\xE3o eletr\xF4nica e em breve outros avan\xE7os vir\xE3o, n\xE3o podendo o profissional da \xE1rea ficar desatualizado sob pena de perder espa\xE7o na atividade jur\xEDdica.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(AsidePitch, null), /*#__PURE__*/React.createElement(Panel, {
    titleLead: "Videos",
    title: "tutoriais",
    padding: "var(--space-6)"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: "var(--space-5)"
    }
  }, tutoriais.map(t => /*#__PURE__*/React.createElement("li", {
    key: t
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      textDecoration: "none",
      color: "var(--text-body)",
      font: "var(--type-body)"
    }
  }, t))))), /*#__PURE__*/React.createElement(Panel, {
    titleLead: "Imagens",
    title: "software",
    padding: "var(--space-6)"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-sans)",
      color: "var(--text-muted)"
    }
  }, "Galeria de telas do gerenciador.")))));
}
Object.assign(window, {
  ProductsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/codemix-web/ProductsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/codemix-web/SiteChrome.jsx
try { (() => {
const {
  Logo,
  NavTabs,
  HighlightBar
} = window.CodemixDesignSystem_95bbea;
function SiteHeader({
  tab,
  onTab,
  subnav
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: "var(--grad-chrome)",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(120% 140% at 62% 10%,rgba(255,255,255,.06) 0%,rgba(255,255,255,0) 55%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "18px var(--container-gutter) 12px",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "white",
    height: 54,
    assetBase: "../../",
    tagline: "Solu\xE7\xF5es em Sistemas de Informa\xE7\xE3o"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      font: "var(--fw-regular) var(--fs-body-sm)/1.6 var(--font-sans)",
      color: "var(--text-on-dark-muted)"
    }
  }, /*#__PURE__*/React.createElement("div", null, "ligue [ 41 ] 3022 8263"), /*#__PURE__*/React.createElement("div", null, "\u2709 info@codemix.com.br"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "0 var(--container-gutter)"
    }
  }, /*#__PURE__*/React.createElement(NavTabs, {
    items: ["home", "empresa", "produtos", "demonstrações", "suporte", "contato"],
    active: tab,
    onSelect: onTab,
    style: {
      background: "transparent",
      borderTop: "none"
    }
  })), /*#__PURE__*/React.createElement(HighlightBar, {
    right: "www.codemix.com.br"
  }, subnav));
}
Object.assign(window, {
  SiteHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/codemix-web/SiteChrome.jsx", error: String((e && e.message) || e) }); }

__ds_ns.BulletList = __ds_scope.BulletList;

__ds_ns.MediaLinkList = __ds_scope.MediaLinkList;

__ds_ns.ProductThumb = __ds_scope.ProductThumb;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.LinkArrow = __ds_scope.LinkArrow;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.HighlightBar = __ds_scope.HighlightBar;

__ds_ns.NavTabs = __ds_scope.NavTabs;

__ds_ns.Panel = __ds_scope.Panel;

})();
