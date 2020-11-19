import { take, call, put, select, takeLatest } from 'redux-saga/effects';
import PostFetcher from 'app/fetchers/postFetcher';
import { actions } from './slice';
import Post from 'app/models/post';

const postFetcher = new PostFetcher();

export function* fetchPostsTask() {
  let posts: Post[] = [
    {
      id: 'p1',
      owner: 'Hiếu Trần',
      ownerAvatar:
        'https://lh3.googleusercontent.com/TtzZw1i1p988V8hIA-PMwjFBA3Q27XYZXxDdKr808DCehRZTwXvMpbCUEEGs9wcyDVPKeGxezs-fzQswVCEa3-P6r3kWI7z4IoHZnLE5At6fyBIKSVPmYOxBAyNxhmbtZqyiFmyyTa8Y28ZXnj6dQ10RZ-VuGSb8CLv_uS-hARBfYgxyaxPp-FaU3e4aRtg5wXb58ZLX2abgWmMkL5QDk-HmSyzmXCXheCe_PVZECgi-fEFemt9LayXj3ByGmxHtz7yZaVIfWqSioU-kUI1VeSQBvwoMq2N-L_fk4tkoBUzvxC9MHHRZHDlZfu93zgRHTEXSwgqAQ3IpKBJre2JQ_Ex6GHNm7glE9F2g1Z485IGP_0Rx-FJU0J01E6clsHPD_KXXNH8OhGiriFSOLGqKPA9NkouWMHtTzxOaXkCYejv309mAO2tmm4oXjEvWLgV64hZQAZ7GiMpKXFetmnH-bhaawJ2hVpzx-MyijWax8aj_Fvfv0CE7DHaNDHF-QFJmBNt0vK_a-ILaggufvKZwpw3TPMLejUYyDC8ewD1gKbCBlWkDBYifNRGIxDcxV32hIbDfCU-aJqBgOiDFcqnygwwtAn_KWs1gdMazQPb-SuTGMZ_hqIw0sx_1X8Tr-GEAMhY2oDF4rSQV2ghjSD2s7740XXsINgQ0fdK_A5WFctQwCybDp40UVbigqbejOw=w729-h972-no?authuser=0',
      content: 'Có ai có khóa học tiếng anh nào hay không?',
      postComments: [
        {
          id: 'comment1',
          owner: 'Lê Trang',
          content: 'Chị có nè, inbox chị đi nhé',
          postId: 'p1',
        },
      ],
    },
    {
      id: 'p2',
      owner: 'Lê Trang',
      ownerAvatar:
        'https://scontent.fvca1-2.fna.fbcdn.net/v/t1.0-9/120123166_10158465360393956_8815174325295557887_n.jpg?_nc_cat=100&ccb=2&_nc_sid=09cbfe&_nc_ohc=1zpC98ZIgGIAX_Dj9Mt&_nc_ht=scontent.fvca1-2.fna&oh=8361b5528fa55e30439223d27fa7d998&oe=5FDBF5E4',
      content:
        'Các bạn có muốn tham gia vào group tiếng anh giao tiếp cơ bản ko?',
    },
    {
      id: 'p3',
      owner: 'Hiếu Trần',
      ownerAvatar:
        'https://lh3.googleusercontent.com/TtzZw1i1p988V8hIA-PMwjFBA3Q27XYZXxDdKr808DCehRZTwXvMpbCUEEGs9wcyDVPKeGxezs-fzQswVCEa3-P6r3kWI7z4IoHZnLE5At6fyBIKSVPmYOxBAyNxhmbtZqyiFmyyTa8Y28ZXnj6dQ10RZ-VuGSb8CLv_uS-hARBfYgxyaxPp-FaU3e4aRtg5wXb58ZLX2abgWmMkL5QDk-HmSyzmXCXheCe_PVZECgi-fEFemt9LayXj3ByGmxHtz7yZaVIfWqSioU-kUI1VeSQBvwoMq2N-L_fk4tkoBUzvxC9MHHRZHDlZfu93zgRHTEXSwgqAQ3IpKBJre2JQ_Ex6GHNm7glE9F2g1Z485IGP_0Rx-FJU0J01E6clsHPD_KXXNH8OhGiriFSOLGqKPA9NkouWMHtTzxOaXkCYejv309mAO2tmm4oXjEvWLgV64hZQAZ7GiMpKXFetmnH-bhaawJ2hVpzx-MyijWax8aj_Fvfv0CE7DHaNDHF-QFJmBNt0vK_a-ILaggufvKZwpw3TPMLejUYyDC8ewD1gKbCBlWkDBYifNRGIxDcxV32hIbDfCU-aJqBgOiDFcqnygwwtAn_KWs1gdMazQPb-SuTGMZ_hqIw0sx_1X8Tr-GEAMhY2oDF4rSQV2ghjSD2s7740XXsINgQ0fdK_A5WFctQwCybDp40UVbigqbejOw=w729-h972-no?authuser=0',
      content:
        'Có bạn nào biết các thì hay dùng trong giao tiếp hàng ngày không?',
    },
    {
      id: 'p4',
      owner: 'Lê Trang',
      ownerAvatar:
        'https://scontent.fvca1-2.fna.fbcdn.net/v/t1.0-9/120123166_10158465360393956_8815174325295557887_n.jpg?_nc_cat=100&ccb=2&_nc_sid=09cbfe&_nc_ohc=1zpC98ZIgGIAX_Dj9Mt&_nc_ht=scontent.fvca1-2.fna&oh=8361b5528fa55e30439223d27fa7d998&oe=5FDBF5E4',
      content:
        'Cùng thảo luận các từ vựng trong ngành công nghệ thông tin nhé?',
    },
    {
      id: 'p5',
      owner: 'Hiếu Trần',
      ownerAvatar:
        'https://lh3.googleusercontent.com/TtzZw1i1p988V8hIA-PMwjFBA3Q27XYZXxDdKr808DCehRZTwXvMpbCUEEGs9wcyDVPKeGxezs-fzQswVCEa3-P6r3kWI7z4IoHZnLE5At6fyBIKSVPmYOxBAyNxhmbtZqyiFmyyTa8Y28ZXnj6dQ10RZ-VuGSb8CLv_uS-hARBfYgxyaxPp-FaU3e4aRtg5wXb58ZLX2abgWmMkL5QDk-HmSyzmXCXheCe_PVZECgi-fEFemt9LayXj3ByGmxHtz7yZaVIfWqSioU-kUI1VeSQBvwoMq2N-L_fk4tkoBUzvxC9MHHRZHDlZfu93zgRHTEXSwgqAQ3IpKBJre2JQ_Ex6GHNm7glE9F2g1Z485IGP_0Rx-FJU0J01E6clsHPD_KXXNH8OhGiriFSOLGqKPA9NkouWMHtTzxOaXkCYejv309mAO2tmm4oXjEvWLgV64hZQAZ7GiMpKXFetmnH-bhaawJ2hVpzx-MyijWax8aj_Fvfv0CE7DHaNDHF-QFJmBNt0vK_a-ILaggufvKZwpw3TPMLejUYyDC8ewD1gKbCBlWkDBYifNRGIxDcxV32hIbDfCU-aJqBgOiDFcqnygwwtAn_KWs1gdMazQPb-SuTGMZ_hqIw0sx_1X8Tr-GEAMhY2oDF4rSQV2ghjSD2s7740XXsINgQ0fdK_A5WFctQwCybDp40UVbigqbejOw=w729-h972-no?authuser=0',
      content:
        'Các bạn nghĩ sao về tầm quan trọng tiếng anh trong cuộc sống hiện nay?',
    },
    {
      id: 'p11',
      owner: 'Hiếu Trần',
      ownerAvatar:
        'https://lh3.googleusercontent.com/TtzZw1i1p988V8hIA-PMwjFBA3Q27XYZXxDdKr808DCehRZTwXvMpbCUEEGs9wcyDVPKeGxezs-fzQswVCEa3-P6r3kWI7z4IoHZnLE5At6fyBIKSVPmYOxBAyNxhmbtZqyiFmyyTa8Y28ZXnj6dQ10RZ-VuGSb8CLv_uS-hARBfYgxyaxPp-FaU3e4aRtg5wXb58ZLX2abgWmMkL5QDk-HmSyzmXCXheCe_PVZECgi-fEFemt9LayXj3ByGmxHtz7yZaVIfWqSioU-kUI1VeSQBvwoMq2N-L_fk4tkoBUzvxC9MHHRZHDlZfu93zgRHTEXSwgqAQ3IpKBJre2JQ_Ex6GHNm7glE9F2g1Z485IGP_0Rx-FJU0J01E6clsHPD_KXXNH8OhGiriFSOLGqKPA9NkouWMHtTzxOaXkCYejv309mAO2tmm4oXjEvWLgV64hZQAZ7GiMpKXFetmnH-bhaawJ2hVpzx-MyijWax8aj_Fvfv0CE7DHaNDHF-QFJmBNt0vK_a-ILaggufvKZwpw3TPMLejUYyDC8ewD1gKbCBlWkDBYifNRGIxDcxV32hIbDfCU-aJqBgOiDFcqnygwwtAn_KWs1gdMazQPb-SuTGMZ_hqIw0sx_1X8Tr-GEAMhY2oDF4rSQV2ghjSD2s7740XXsINgQ0fdK_A5WFctQwCybDp40UVbigqbejOw=w729-h972-no?authuser=0',
      content: 'Mình đang cần bộ đề ôn thi TOIEC, có bạn nào có không?',
    },
    {
      id: 'p12',
      owner: 'Hiếu Trần',
      ownerAvatar:
        'https://lh3.googleusercontent.com/TtzZw1i1p988V8hIA-PMwjFBA3Q27XYZXxDdKr808DCehRZTwXvMpbCUEEGs9wcyDVPKeGxezs-fzQswVCEa3-P6r3kWI7z4IoHZnLE5At6fyBIKSVPmYOxBAyNxhmbtZqyiFmyyTa8Y28ZXnj6dQ10RZ-VuGSb8CLv_uS-hARBfYgxyaxPp-FaU3e4aRtg5wXb58ZLX2abgWmMkL5QDk-HmSyzmXCXheCe_PVZECgi-fEFemt9LayXj3ByGmxHtz7yZaVIfWqSioU-kUI1VeSQBvwoMq2N-L_fk4tkoBUzvxC9MHHRZHDlZfu93zgRHTEXSwgqAQ3IpKBJre2JQ_Ex6GHNm7glE9F2g1Z485IGP_0Rx-FJU0J01E6clsHPD_KXXNH8OhGiriFSOLGqKPA9NkouWMHtTzxOaXkCYejv309mAO2tmm4oXjEvWLgV64hZQAZ7GiMpKXFetmnH-bhaawJ2hVpzx-MyijWax8aj_Fvfv0CE7DHaNDHF-QFJmBNt0vK_a-ILaggufvKZwpw3TPMLejUYyDC8ewD1gKbCBlWkDBYifNRGIxDcxV32hIbDfCU-aJqBgOiDFcqnygwwtAn_KWs1gdMazQPb-SuTGMZ_hqIw0sx_1X8Tr-GEAMhY2oDF4rSQV2ghjSD2s7740XXsINgQ0fdK_A5WFctQwCybDp40UVbigqbejOw=w729-h972-no?authuser=0',
      content: 'Cuối tuần này ai muốn tham giao English Coffee ko?',
    },
    {
      id: 'p13',
      owner: 'Lê Trang',
      ownerAvatar:
        'https://scontent.fvca1-2.fna.fbcdn.net/v/t1.0-9/120123166_10158465360393956_8815174325295557887_n.jpg?_nc_cat=100&ccb=2&_nc_sid=09cbfe&_nc_ohc=1zpC98ZIgGIAX_Dj9Mt&_nc_ht=scontent.fvca1-2.fna&oh=8361b5528fa55e30439223d27fa7d998&oe=5FDBF5E4',
      content: 'Các bạn có phân biệt được các loại certificate của TOIEC ko?',
    },
    {
      id: 'p14',
      owner: 'Lê Trang',
      ownerAvatar:
        'https://scontent.fvca1-2.fna.fbcdn.net/v/t1.0-9/120123166_10158465360393956_8815174325295557887_n.jpg?_nc_cat=100&ccb=2&_nc_sid=09cbfe&_nc_ohc=1zpC98ZIgGIAX_Dj9Mt&_nc_ht=scontent.fvca1-2.fna&oh=8361b5528fa55e30439223d27fa7d998&oe=5FDBF5E4',
      content: 'IELTS mới đổi cấu trúc đề thi, có ai biết về việc này không?',
    },
  ];
  try {
    // posts = yield postFetcher.queryManyAsync({});
  } catch (error) {
    console.log(error);
  }
  yield put(actions.fetchPostsCompleted(posts));
}

export function* postSaga() {
  yield takeLatest(actions.fetchPosts.type, fetchPostsTask);
}
