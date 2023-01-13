export default function debounce(func,delay){
    let timer;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(func,delay);
    }
}