import debounce from "./debounce.js";

export class Slider{
    constructor(wrapper,slide){
        this.wrapper = document.querySelector(wrapper);
        this.slide = document.querySelector(slide);
        this.changeEvent = new Event('changeEvent');
        this.position = {
            a: 0,
            b: 0,
            c: 0,
            final: 0,
            percorrido: 0
        }
    }
    //1)EVENTOS E ATUALIZAR DISTANCIAS
    //eventos
    mouseDown(event){
        let eventType;
        if(event.type === 'mousedown'){
            event.preventDefault();
            this.position.a = event.clientX;
            eventType = `mousemove`;
        }
        else if(event.type === 'touchstart'){
            this.position.a = event.changedTouches[0].clientX;
            eventType = `touchmove`;
        }
        this.wrapper.addEventListener(eventType,this.mouseMove);
    }
    mouseMove(event){
        if(event.type === 'mousemove'){
            this.position.percorrido = event.clientX;//calculo pra mudar o slide ao arrastar pro lado
            this.position.b = event.clientX + this.position.final;//aq
            this.position.c = -(this.position.a - this.position.b);
            this.transition(false);//setar false antes de mover o slide p remover a propriedade
        }
        else if(event.type === 'touchmove'){
            this.position.percorrido = event.changedTouches[0].clientX;
            this.position.b = event.changedTouches[0].clientX + this.position.final;
            this.position.c = -(this.position.a - this.position.b);
            this.transition(false);
        }
        this.moveSlide(this.position.c);
    }
    mouseUp(event){
        this.position.final = this.position.c;
        this.wrapper.removeEventListener('mousemove',this.mouseMove);
        this.changeOnEnd(this.position.a - this.position.percorrido);
        this.transition(true);
    }
    //slide
    moveSlide(px){
        this.slide.style.transform = `translate3d(${px}px,0,0)`;
    }
    //2)SLIDE CONFIG - alignSlideCenter slideConfig changeSlide
    alignSlideCenter(elemento){
        const margin = (this.wrapper.offsetWidth - elemento.offsetWidth) / 2;
        return (margin - elemento.offsetLeft);
    }
    slideConfig(){//depois criar um array de objeto com as seguintes informações: elemento e distancia left
        this.arraySlide = [...this.slide.children].map((elemento) => {
            const distLeft = this.alignSlideCenter(elemento);
            return {//[{},{},{}]
                elemento,distLeft
            }
        });
    }
    changeSlide(index){
        const d = document.querySelector('.custom-control');
        const distancia = this.arraySlide[index].distLeft;
        this.moveSlide(distancia);
        this.nextPrev(index);
        this.position.final = distancia;//n é necessário,pois o slide sempre começará do item 0
        this.changeActive(index);
        //criar evento p/ comunicar com a classe filha quando houver mudança no slide
        this.wrapper.dispatchEvent(this.changeEvent);
        d.dispatchEvent(this.changeEvent);
    }
    //3)NEXT PREV - nextPrev next prev changeOnEnd transition
    nextPrev(index){
        this.buttons = {
            prev: (this.arraySlide[index - 1] !== undefined ) ? index - 1 : undefined,
            active: index,
            next: (this.arraySlide[index + 1] !== undefined ) ? index + 1 : undefined
        }
    }
    next(){
        this.buttons.next !== undefined ? this.changeSlide(this.buttons.next) : undefined;
    }
    prev(){
        this.buttons.prev !== undefined ? this.changeSlide(this.buttons.prev) : undefined;
    }
    changeOnEnd(px){
        if(px > 120 && this.buttons.next !== undefined)
            this.next();
        else if(px < -120 && this.buttons.prev !== undefined)
            this.prev();
        else
            this.changeSlide(this.buttons.active);
    }
    transition(boolean){
        this.slide.style.transition = (boolean) ? 'transform 1s' : '';
    }
    //4)RESIZE - changeActive onResize addOnResize
    changeActive(index){
        this.arraySlide.forEach((e) => e.elemento.classList.remove('active'));
        this.arraySlide[index].elemento.classList.add('active');
    }
    onResize(){
        setTimeout(() => {
            this.slideConfig();
            this.moveSlide(this.arraySlide[this.buttons.active].distLeft);
            //console.log('resize');//evento chamado várias vezes
        },1000);
    }
    addOnResize(){
        window.addEventListener('resize',this.onResize);
    }
    //6)CONFIGURAÇÕES - addEvents bind init
    addEvents(){
        this.wrapper.addEventListener('mousedown',this.mouseDown);
        this.wrapper.addEventListener('mouseup',this.mouseUp);
        this.wrapper.addEventListener('touchstart',this.mouseDown);
        this.wrapper.addEventListener('touchend',this.mouseUp);
    }
    //bind pro this referenciar a classe e não o chamador do evento 
    bind(){
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.onResize = debounce(this.onResize.bind(this),300);
        this.prev = this.prev.bind(this);
        this.next = this.next.bind(this);
    }
    //iniciar
    init(){
        this.bind();
        this.addEvents();
        this.slideConfig();
        this.addOnResize();
    }
}
//5) NAV- addButtons addButtonsEvents
export class SliderNav extends Slider{
    constructor(wrapper,slide){
        super(wrapper,slide);
        this.bindSlideNav();
    }
    addButtons(prev,next){
        this.elementPrev = document.querySelector(prev);
        this.elementNext = document.querySelector(next);
        this.addButtonsEvents();
        this.addPaginationEvent();
        this.addImageEvent('.custom-control');
        this.activePagination();//marcando ativo a primeira paginação
        this.activeImage();//marcando ativo a primeira imagem de icone
    }
    addButtonsEvents(){
        this.elementPrev.addEventListener('click',this.prev);
        this.elementNext.addEventListener('click',this.next);
        this.transition(true);
    }
    //6) PAGINAÇÃO createControls controlsEvent addPaginationEvent
    createControls(){
        const arrayLi = [...this.slide.children];
        const controls = document.createElement('ul');
        controls.dataset.control = `slide`;//data-control="slide"
        arrayLi.forEach((e,i) => {
            controls.innerHTML += `<li><a href="#${i}">${i}</a> </li>`;
        });
        this.wrapper.appendChild(controls);
        return controls;
    }
    controlsEvent(elemento,indice){
        elemento.addEventListener('click',(event) => {
            event.preventDefault();
            this.changeSlide(indice);
            this.activePagination();
            this.images !== undefined ? this.activeImage() : undefined;
        });
    }
    addPaginationEvent(){
        this.controls = [...this.createControls().children];
        this.controls.forEach((e,i) => {
            this.controlsEvent(e,i);
        });
        this.wrapper.addEventListener('changeEvent',this.activePagination);
    }
    addImageEvent(custom){
        this.custom = document.querySelector(custom);
        this.images = [...this.custom.children];
        this.images.forEach(this.controlsEvent);//podemos omitir os parametros nesse caso(elemento e indice)
        this.custom.addEventListener('changeEvent',this.activeImage);
    }
    activePagination(){
        this.controls.forEach(e => e.classList.remove('active'));
        this.controls[this.buttons.active].classList.add('active');
    }
    activeImage(){
        this.images.forEach(e => e.classList.remove('active'));
        this.images[this.buttons.active].classList.add('active');
    }
    bindSlideNav(){
        this.activePagination = this.activePagination.bind(this);
        this.activeImage = this.activeImage.bind(this);
        this.controlsEvent = this.controlsEvent.bind(this);
    }
}