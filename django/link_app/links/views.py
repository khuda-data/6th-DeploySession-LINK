from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Link
from .serializers import LinkSerializer
from bs4 import BeautifulSoup
import requests
import logging
import time
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# GPT-4o-mini API 설정
load_dotenv()
GPT4O_API_KEY = os.getenv("OPENAI_API_KEY")
GPT4O_API_URL = "https://api.openai.com/v1/chat/completions"

# 429 Too Many Requests 처리 함수
def fetch_url_with_retry(url, max_retries=3):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 5))
                logger.warning(f"429 Too Many Requests: Retrying in {retry_after} seconds...")
                time.sleep(retry_after)
                continue
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Attempt {attempt + 1} failed: {e}")
            if attempt + 1 == max_retries:
                raise e

# Selenium을 사용하여 동적 콘텐츠 로드
def fetch_dynamic_content(url):
    from selenium.webdriver.common.by import By

    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-extensions")
    service = Service(r'C:\Users\king7\OneDrive\문서\GitHub\link_project\django\link_app\links\chromedriver.exe')

    driver = webdriver.Chrome(service=service, options=options)
    try:
        logger.debug(f"Fetching dynamic content from {url}")
        driver.get(url)
        time.sleep(2)

        iframe = driver.find_element(By.ID, "mainFrame")
        driver.switch_to.frame(iframe)

        html_content = driver.page_source
        logger.debug(f"Extracted iframe content: {html_content[:500]}")
        return html_content
    except Exception as e:
        logger.error(f"Error while fetching dynamic content: {e}")
        return None
    finally:
        driver.quit()

# BeautifulSoup 이미지 추출 함수
def get_image_url(soup):
    img = soup.find('img')
    if img and img.get('src'):
        return img['src']
    return None

# GPT-4o-mini API 호출 함수 (요약 생성)
def generate_summary_gpt4o(text):
    try:
        prompt = (
            "Summarize the following text in Korean. Only output the summary without any extra explanations or comments. "
            "The summary should be concise, focus only on the main points, and stay within approximately 350 characters in length.\n\n"
            f"Text: {text}\n"
        )

        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GPT4O_API_KEY}"
        }
        response = requests.post(GPT4O_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content'].strip()
    except requests.exceptions.RequestException as e:
        logger.error(f"GPT-4o API error: {e}")
        return "요약 생성에 실패했습니다."

# GPT-4o-mini API 호출 함수 (키워드 추출)
def extract_keywords_gpt4o(text):
    try:
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are an expert keyword extractor."},
                {
                    "role": "user",
                    "content": (
                        "Extract 3 main keywords from the following text. "
                        "Output the keywords separated by commas without numbering or extra characters.\n\n"
                        f"Text: {text}"
                    )
                },
            ],
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GPT4O_API_KEY}"
        }
        response = requests.post(GPT4O_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        keywords = response.json()['choices'][0]['message']['content'].strip()
        return [kw.strip() for kw in keywords.split(",")]
    except requests.exceptions.RequestException as e:
        logger.error(f"GPT-4o API error: {e}")
        return ["키워드 추출 실패"]

class LinkViewSet(viewsets.ModelViewSet):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer

    def update(self, request, *args, **kwargs):
        logger.debug(f"Update request data: {request.data}")
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            category = serializer.validated_data.get('category', 'ALL')
            serializer.validated_data['category'] = category.strip() or 'ALL'
            self.perform_update(serializer)
            logger.debug(f"Updated instance data: {serializer.data}")
            return Response(serializer.data)

        logger.error(f"Update validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        data = request.data
        logger = logging.getLogger(__name__)
        logger.debug(f"Received data for creation: {data}")  # 데이터 로그 출력

        data['category'] = data.get('category', '').strip() or 'ALL'
        serializer = self.get_serializer(data=data)

        if not serializer.is_valid():
            logger.error(f"Validation failed: {serializer.errors}")  # 에러 로그 추가
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        user_uuid = self.request.query_params.get('user_uuid')
        if user_uuid:
            return Link.objects.filter(user_uuid=user_uuid)
        return super().get_queryset()

    @action(detail=False, methods=['post'])
    def extract_from_url(self, request):
        url = request.data.get('url', '')
        user_uuid = request.data.get('user_uuid', None)

        logger.debug(f"Received URL: {url}")
        logger.debug(f"Received UUID: {user_uuid}")

        if not url:
            return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not user_uuid:
            return Response({'error': 'User UUID is required'}, status=status.HTTP_400_BAD_REQUEST)

        existing_link = Link.objects.filter(url=url, user_uuid=user_uuid).first()
        if existing_link:
            return Response({
                'id': existing_link.id,
                'title': existing_link.title,
                'summary': existing_link.description,
                'keywords': existing_link.keywords,
                'image_url': existing_link.image_url,
                'category': existing_link.category or 'ALL',
            }, status=status.HTTP_200_OK)

        try:
            response = fetch_url_with_retry(url)
            html_content = response.text

            soup = BeautifulSoup(html_content, 'html.parser')
            title = soup.title.string if soup.title else 'No Title'
            paragraphs = soup.find_all('p')
            text_content = ' '.join([para.get_text() for para in paragraphs])
            image_url = get_image_url(soup)

            if not text_content.strip():
                return Response({
                    'title': title,
                    'summary': "직접 채워주세요",
                    'keywords': ["직접 채워주세요"],
                    'image_url': None
                })

            keyword_list = extract_keywords_gpt4o(text_content)
            summary_result = generate_summary_gpt4o(text_content)

            return Response({
                'title': title,
                'summary': summary_result,
                'keywords': keyword_list,
                'image_url': image_url
            })

        except requests.exceptions.RequestException as e:
            logger.error("RequestException: %s", e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error("Unexpected error: %s", e)
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
