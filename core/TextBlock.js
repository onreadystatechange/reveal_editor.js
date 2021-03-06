import CKEditorConfig from './configs/CKEditorConfig';
import _u from './util';
import Block from './Block';
import DDMRR from './ddmrr';

/* eslint-disable no-param-reassign, radix */

class TextBlock extends Block {
  constructor({ parent, el }) {
    super({ parent, el });

    this.minsize.width = 160;
    this.anchorTypes = ['e', 'w'];
  }

  getState() {
    const style = getComputedStyle(this.dom);

    const state = {
      ...this.state,
      borderWidth: this.getLength(style.borderTopWidth),
      borderColor: this.getColor(style.borderTopColor),
      borderStyle: this.getBorderStyle(style.borderTopStyle),
      color: this.getColor(style.color),
      backgroundColor: this.getColor(style.backgroundColor),
      fontSize: this.getFontSize(this.dom.style.fontSize),
      zIndex: this.getZIndex(style.zIndex),
    };

    return state;
  }

  setState(params) {
    Object.keys(params).forEach((key) => {
      this.dom.style[key] = params[key];
    });

    this.ddmrr && this.ddmrr.relocateDom();
    return this.getState();
  }

  toManipulate() {
    this.ddmrr = new DDMRR(this.dom, this.editor.reveal, {
      resize: {
        key: 'resize',
        enable: true,
        anchors: ['e', 'w'],
      },
    });

    this.ddmrr.emitter.on('dblclick', () => {
      this.ddmrr.release();
      this.ddmrr = null;
      this.toEdit();
    });

    super.toManipulate();
  }

  toPreview = () => {
    this.blockContent.dom.removeAttribute('contenteditable');
    if (this.CKEDITORInstance) {
      this.CKEDITORInstance.destroy();
    }
    super.toPreview();
  }

  stopPropagation = (event) => {
    event.stopPropagation();
  }

  toEdit() {
    this.state.status = 'editing';
    this.blockContent.dom.setAttribute('contenteditable', 'true');
    this.dom.setAttribute('sc-block-status', 'editing');

    let initiatedFlag = false;
    Object.keys(CKEDITOR.instances).some((name) => {
      const ariaLabel = this.blockContent.dom.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.split(', ')[1] === name) {
        CKEDITOR.instances[name].focus();
        this.CKEDITORInstance = CKEDITOR.instances[name];
        initiatedFlag = true;
        return true;
      }
      return false;
    });
    if (!initiatedFlag) {
      this.CKEDITORInstance = CKEDITOR.inline(this.blockContent.dom, CKEditorConfig);
    }
    _u.clearUserSelection();

    super.toEdit();
  }
}

export default TextBlock;
