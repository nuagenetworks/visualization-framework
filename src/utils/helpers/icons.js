const icons = {
    'nsgateway': 'icon-nsgateway-resized.png'
};

const defaultIcon = 'nsgateway';

export default (icon) => `${process.env.PUBLIC_URL}/icons/${ icons[icon] || icons[defaultIcon]}`
