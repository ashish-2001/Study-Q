import videojs from 'video.js';

const changeVideoQuality = (quality: string, player: any) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('quality', quality);
    const newUrl = `${currentUrl.pathname}?${currentUrl.searchParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    player.qualitySelector(quality);
};

class QualitySelectorController extends videojs.getComment('Button'){
    constructor(player: any, options?: any) {
    super(player, options);
    this.addClass('vjs-quality-selector flex justify-center items-center');

    const iconElement = videojs.dom.createEl('i', 
        className: 'vjs-icon-hd text-xl'
    )};
    this.el().appendChild(iconElement);

    const dropUpMenu = videojs.dom.createEl('div', {
        className: 'vjs-custom-dropup-menu absolute hidden'
    });

    dropUpMenu.innerHTML = `
        <ul className="bg-white dark:bg-gray-800 shadow-lg rounded-md mt-1">
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-white" data-quality="1080">1080p</li>
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-white" data-quality="720">720p</li>
            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-white" data-quality="360">360p</li>
        </ul>
    `;
    const dropUpMenuElement = this.el().appendChild(dropUpMenu) as HTMLElement;

    this.on('click', () => {
        const isVisible = dropUpMenuElement.style.display === 'block';
        dropUpMenuElement.style.display = isVisible ? 'none' : 'block';
    });
    this.on('touchend', (e: any) => {
        e.preventDefault();
        const isVisible = dropUpMenuElement.style.display === 'block';
        dropUpMenuElement.style.display = isVisible ? 'none' : 'block';
    });
    dropUpMenuElement.querySelector('li').forEach((item) => {
        item.addEventListener('click', (e: any) => {
            e.stopPropagation();
            const quality = e.target.getAttribute('data-quality');
            const urlParams = new URLSearchParams(window.location.search);
            if(quality !== urlParams.get('quality')){
                changeVideoQuality(quality, player);
            }
            dropUpMenuElement.style.display = 'none';
        });
        item.addEventListener('touchend', (e: any) => {
            const quality = e.target.getAttribute('data-quality');
            if(quality){
                changeVideoQuality(quality, player);
            }
            dropUpMenuElement.style.display = 'none';
            dropUpMenuElement.style.display = 'none';
        });
    });
}


if(typeof window !== 'undefined') {
    window.changeVideoQuality = changeVideoQuality;
    videojs.registerComponent(
        'QualitySelectorController',
        QualitySelectorControllerBar
    );
}

export default QualitySelectorControllerBar;