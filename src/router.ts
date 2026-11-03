import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import StudyPage from './pages/StudyPage.vue'
import LessonPage from './pages/LessonPage.vue'
import AccountPage from './pages/AccountPage.vue'
import NotFoundPage from './pages/NotFoundPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: HomePage, meta: { title: '学习首页' } },
    { path: '/learn/:level', component: StudyPage, meta: { title: '等级学习' } },
    { path: '/business', component: StudyPage, meta: { title: '商务日语' } },
    { path: '/lesson/:id', component: LessonPage, meta: { title: '学习内容' } },
    { path: '/profile', component: AccountPage, meta: { title: '个人中心' } },
    { path: '/login', component: AccountPage, meta: { title: '登录' } },
    { path: '/register', component: AccountPage, meta: { title: '注册' } },
    { path: '/:pathMatch(.*)*', component: NotFoundPage, meta: { title: '页面未找到' } },
  ],
})
router.afterEach(to => { document.title = `${String(to.meta.title)} · 言葉 Kotoba` })
