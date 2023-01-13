import {Slider,SliderNav} from "./modules/slide.js";
const slide = new SliderNav('.wrapper','.slide');
slide.init();
slide.changeSlide(0);
slide.addButtons('.prev','.next');