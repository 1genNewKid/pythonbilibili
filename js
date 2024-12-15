import time
import feedparser
import requests

# Server酱的 SendKey
SERVERCHAN_SEND_KEY = "sctp3775tct7etzawtedejeydajemxe"  # 替换为您的 SendKey

# 定义多个 RSS 链接（可扩展）
RSS_FEED_URLS = [
    "https://jumpshop-online.com/collections/%E5%86%8D%E5%85%A5%E8%8D%B7%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0.atom",  # 再入荷
    "https://jumpshop-online.com/collections/top-new.atom",                # 新入荷
    "https://jumpshop-online.com/collections/recommend.atom",                 # 全部商品
    "https://jumpshop-online.com/collections/%E4%BB%8A%E6%9C%88%E3%81%AE%E3%83%90%E3%83%BC%E3%82%B9%E3%83%87%E3%83%BC%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0-1.atom"#今月生日

]

# 用于存储每个 RSS 的最新文章标题
last_titles = {url: None for url in RSS_FEED_URLS}


def check_rss_and_notify():
    """
    轮询所有 RSS 链接，检测更新并推送通知
    """
    for rss_url in RSS_FEED_URLS:
        # 解析 RSS
        feed = feedparser.parse(rss_url)
        
        # 检查是否有文章
        if feed.entries:
            latest_entry = feed.entries[0]  # 获取最新的一篇文章
            title = latest_entry.title  # 获取文章标题
            link = latest_entry.link  # 获取文章链接
            
            # 如果有新文章，推送通知
            if title != last_titles[rss_url]:
                last_titles[rss_url] = title  # 更新最新标题记录
                send_serverchan_notification(title, link, rss_url)


def send_serverchan_notification(title, link, rss_url):
    """
    使用 Server酱发送微信通知
    :param title: 新文章标题
    :param link: 新文章链接
    :param rss_url: RSS 链接（用于标识来源）
    """
    url = f"https://sctapi.ftqq.com/{SERVERCHAN_SEND_KEY}.send"
    data = {
        "title": f"新文章更新：{title}",  # 通知标题
        "desp": f"文章链接：{link}\n\n来源：{rss_url}"  # 通知内容
    }
    # 发送 POST 请求
    response = requests.post(url, data=data)
    if response.status_code == 200:
        print(f"微信通知发送成功！来源：{rss_url}")
    else:
        print(f"微信通知发送失败！来源：{rss_url}，错误：", response.text)


if __name__ == "__main__":
    # 每 10 分钟检测一次 RSS 更新
    while True:
        check_rss_and_notify()
        time.sleep(600)  # 检测间隔时间（单位：秒）
