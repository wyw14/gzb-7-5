<template>
  <div class="piece-detail-page" v-if="piece">
    <div class="container">
      <div class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回曲目广场
      </div>

      <div class="detail-grid">
        <div class="main-content">
          <div class="piece-header-card card">
            <div class="piece-title-section">
              <div class="title-row">
                <h1 class="piece-title">{{ piece.title }}</h1>
                <span class="difficulty-tag" :class="piece.difficulty">{{ piece.difficulty }}</span>
              </div>
              <p class="piece-composer" v-if="piece.composer">作曲：{{ piece.composer }}</p>
            </div>

            <div class="piece-meta">
              <el-tag size="large" type="info" effect="light">
                <el-icon><Headset /></el-icon>
                {{ piece.instrument }}
              </el-tag>
              <el-tag size="large" type="success" effect="light">
                <el-icon><MagicStick /></el-icon>
                {{ piece.style }}
              </el-tag>
              <span class="practice-info">
                <el-icon><Calendar /></el-icon>
                已练习 {{ piece.practiceDays || 1 }} 天
              </span>
            </div>

            <div class="piece-progress-section">
              <div class="progress-header">
                <span>练习进度</span>
                <span class="progress-percent">{{ piece.progress }}%</span>
              </div>
              <el-progress :percentage="piece.progress" :stroke-width="12" />
            </div>
          </div>

          <div class="info-card card" v-if="piece.painPoints">
            <div class="info-header">
              <el-icon size="20" color="#f59e0b"><Warning /></el-icon>
              <h3>练习痛点</h3>
            </div>
            <p class="info-content">{{ piece.painPoints }}</p>
          </div>

          <div class="info-card card" v-if="piece.lookingFor">
            <div class="info-header">
              <el-icon size="20" color="#6366f1"><Search /></el-icon>
              <h3>想找的搭子</h3>
            </div>
            <p class="info-content">{{ piece.lookingFor }}</p>
          </div>

          <div class="publisher-card card" v-if="piece.user">
            <div class="publisher-header">
              <el-icon size="20" color="#10b981"><User /></el-icon>
              <h3>发布者</h3>
            </div>
            <div class="publisher-info" @click="goUserDetail(piece.user.id)">
              <img :src="piece.user.avatar" class="avatar-lg" alt="" />
              <div class="publisher-detail">
                <div class="publisher-name">{{ piece.user.username }}</div>
                <div class="publisher-bio">{{ piece.user.bio }}</div>
                <div class="publisher-tags">
                  <el-tag v-for="inst in piece.user.instruments" :key="inst" size="small" type="info">
                    {{ inst }}
                  </el-tag>
                  <el-tag size="small" type="warning">{{ piece.user.skillLevel }}</el-tag>
                  <el-tag size="small" type="success">
                    <el-icon><Star /></el-icon>
                    {{ piece.user.rating }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar">
          <div class="buddies-card card">
            <div class="buddies-header">
              <h3>
                <el-icon><UserFilled /></el-icon>
                也在练这首曲子
              </h3>
              <span class="buddies-count">{{ piece.buddies?.length || 0 }} 人</span>
            </div>

            <div v-if="piece.buddies && piece.buddies.length > 0" class="buddies-list">
              <div
                v-for="buddy in piece.buddies"
                :key="buddy.id"
                class="buddy-item"
                @click="goUserDetail(buddy.user.id)"
              >
                <img :src="buddy.user.avatar" class="avatar" alt="" />
                <div class="buddy-info">
                  <div class="buddy-name">{{ buddy.user.username }}</div>
                  <div class="buddy-meta">
                    <span>{{ buddy.user.skillLevel }}</span>
                    <span>·</span>
                    <span>练了 {{ buddy.practiceDays }} 天</span>
                  </div>
                  <div class="buddy-progress">
                    <el-progress :percentage="buddy.progress" :stroke-width="4" :show-text="false" />
                    <span class="buddy-progress-num">{{ buddy.progress }}%</span>
                  </div>
                </div>
                <el-button type="primary" size="small" @click.stop="openInviteDialog(buddy)">
                  约练
                </el-button>
              </div>
            </div>

            <div v-else class="no-buddies">
              <el-icon size="32"><User /></el-icon>
              <p>暂时还没有其他人在练这首曲子</p>
              <p class="tip">成为第一个分享的人吧！</p>
            </div>
          </div>

          <div class="action-card card" v-if="userStore.isLoggedIn">
            <el-button type="primary" size="large" @click="openInviteDialog(piece)" block>
              <el-icon><Plus /></el-icon>
              我也在练这首
            </el-button>
            <el-button size="large" @click="openInviteDialog(piece)" block>
              <el-icon><ChatDotRound /></el-icon>
              给发布者留言
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showInvite" title="发送练琴邀约" width="500px">
      <el-form :model="inviteForm" label-width="100px">
        <el-form-item label="邀约对象">
          <span>{{ currentBuddy?.user?.username || piece?.user?.username }}</span>
        </el-form-item>
        <el-form-item label="乐器">
          <span>{{ piece?.instrument }}</span>
        </el-form-item>
        <el-form-item label="练习曲目">
          <span>{{ piece?.title }}</span>
        </el-form-item>
        <el-form-item label="约练时间" prop="meetTime">
          <el-date-picker
            v-model="inviteForm.meetTime"
            type="datetime"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="约练地点" prop="location">
          <el-input v-model="inviteForm.location" placeholder="建议选择公共空间" />
        </el-form-item>
        <el-form-item label="留言">
          <el-input v-model="inviteForm.message" type="textarea" :rows="3" placeholder="给TA留个言..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInvite = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitInvite">发送邀约</el-button>
      </template>
    </el-dialog>
  </div>

  <div v-else class="loading-state">
    <el-icon size="48" class="loading-icon"><Loading /></el-icon>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { pieceApi, invitationApi } from '../api'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Headset, MagicStick, Calendar, Warning, Search, User, UserFilled,
  Star, Plus, ChatDotRound, Loading
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const requireLogin = inject('requireLogin', () => router.push('/login'))

const piece = ref(null)
const showInvite = ref(false)
const currentBuddy = ref(null)
const submitting = ref(false)

const inviteForm = reactive({
  meetTime: null,
  location: '',
  message: ''
})

const goBack = () => {
  router.push('/pieces')
}

const goUserDetail = (userId) => {
  router.push(`/buddies/${userId}`)
}

const openInviteDialog = (buddy) => {
  if (!userStore.isLoggedIn) {
    requireLogin()
    return
  }
  currentBuddy.value = buddy
  inviteForm.meetTime = null
  inviteForm.location = ''
  inviteForm.message = ''
  showInvite.value = true
}

const submitInvite = async () => {
  if (!inviteForm.meetTime || !inviteForm.location) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const targetUser = currentBuddy.value?.user || piece.value?.user
  if (!targetUser) {
    ElMessage.error('无法获取用户信息')
    return
  }

  submitting.value = true
  try {
    await invitationApi.create({
      inviterId: userStore.userId,
      inviteeId: targetUser.id,
      instrument: piece.value.instrument,
      piece: piece.value.title,
      skillLevelMatch: `${userStore.currentUser.skillLevel}-${targetUser.skillLevel}`,
      meetTime: new Date(inviteForm.meetTime).toLocaleString('zh-CN', { hour12: false }),
      location: inviteForm.location,
      latitude: targetUser.latitude,
      longitude: targetUser.longitude,
      message: inviteForm.message
    })
    ElMessage.success('邀约已发送！')
    showInvite.value = false
  } catch (e) {
    ElMessage.error('发送失败')
  } finally {
    submitting.value = false
  }
}

const loadPiece = async () => {
  try {
    piece.value = await pieceApi.get(route.params.id)
  } catch (e) {
    ElMessage.error('加载曲目详情失败')
  }
}

onMounted(() => {
  loadPiece()
})
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  margin-bottom: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--bg-light);
  color: var(--primary-color);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
}

.piece-header-card {
  padding: 32px;
  margin-bottom: 20px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.piece-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.piece-composer {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 20px;
}

.difficulty-tag {
  padding: 4px 14px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
}

.difficulty-tag.初级 {
  background: #d1fae5;
  color: #065f46;
}

.difficulty-tag.中级 {
  background: #fef3c7;
  color: #92400e;
}

.difficulty-tag.高级 {
  background: #fee2e2;
  color: #991b1b;
}

.piece-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}

.piece-meta .el-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.practice-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.piece-progress-section {
  background: var(--bg-light);
  padding: 20px;
  border-radius: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-percent {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
}

.info-card {
  padding: 24px;
  margin-bottom: 20px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.info-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.info-content {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0;
}

.publisher-card {
  padding: 24px;
}

.publisher-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.publisher-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.publisher-info {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.publisher-info:hover {
  background: #eef2ff;
}

.avatar-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.publisher-detail {
  flex: 1;
}

.publisher-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.publisher-bio {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.publisher-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.publisher-tags .el-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.sidebar {
  position: sticky;
  top: 84px;
  align-self: flex-start;
}

.buddies-card {
  padding: 24px;
  margin-bottom: 20px;
}

.buddies-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.buddies-header h3 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.buddies-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.buddies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.buddy-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-light);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.buddy-item:hover {
  background: #eef2ff;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.buddy-info {
  flex: 1;
  min-width: 0;
}

.buddy-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.buddy-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.buddy-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.buddy-progress .el-progress {
  flex: 1;
}

.buddy-progress-num {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 36px;
  text-align: right;
}

.no-buddies {
  text-align: center;
  padding: 30px 16px;
  color: var(--text-secondary);
}

.no-buddies .el-icon {
  color: var(--text-muted);
  margin-bottom: 12px;
}

.no-buddies p {
  margin: 0 0 4px;
}

.no-buddies .tip {
  font-size: 12px;
  color: var(--text-muted);
}

.action-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.loading-icon {
  animation: spin 1s linear infinite;
  color: var(--primary-color);
  margin-bottom: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .piece-header-card {
    padding: 20px;
  }

  .piece-title {
    font-size: 22px;
  }

  .buddy-item {
    flex-wrap: wrap;
  }

  .buddy-item .el-button {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
