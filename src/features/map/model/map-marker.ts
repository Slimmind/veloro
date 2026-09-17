export const createMarkerElement = (satellite = false): HTMLElement => {
	const el = document.createElement('div');
	el.style.cssText = 'width:40px;height:50px;transform:translate(-50%,-100%)';
	const img = document.createElement('img');
	img.src = satellite ? '/marker-satellite.svg' : '/marker.svg';
	img.width = 40;
	img.height = 50;
	el.appendChild(img);
	return el;
};
