from PIL import Image, ImageDraw, ImageFont
import io

img = Image.new('RGB', (400, 200), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((50,50), "ISI MARK\nCM/L-9876543\nIS 15298", fill=(0,0,0))
img.save('test_label.png')
print("Image saved.")
