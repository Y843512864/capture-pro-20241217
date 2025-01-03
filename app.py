   #  -*-coding:utf8 -*-

import base64
from io import BytesIO
from PIL import Image
from ddddocr import DdddOcr
from flask import Flask, request, jsonify
from flask_cors import CORS  # 导入 CORS

app = Flask(__name__)
# 启用 CORS 支持，允许所有源进行跨域请求
CORS(app)
ocr = DdddOcr()


@app.route('/recognize', methods=['POST'])
def recognize_captcha():
    try:
        data = request.json
        image_data = data['image']  # 获取 Base64 编码

        # 去除前缀部分 'data:image/jpeg;base64,' 如果有的话
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]  # 去掉前缀部分

        # 解码 Base64 编码并转换为图片对象
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))

        # 使用 dddocr 识别验证码
        result = ocr.classification(image)

        # 返回识别的结果
        return jsonify({'code': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
