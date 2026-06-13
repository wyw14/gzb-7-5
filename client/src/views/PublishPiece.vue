<template>
  <div class="publish-piece-page">
    <div class="page-header">
      <div class="container">
        <h1>🎵 发布练习曲目</h1>
        <p>分享你正在练习的曲子，找到一起进步的搭子</p>
      </div>
    </div>

    <div class="container">
      <div class="form-card card">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" label-position="top">
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            <div class="form-row">
              <el-form-item label="曲目名称 *" prop="title" class="form-item flex-2">
                <el-input v-model="form.title" placeholder="如：爱的罗曼史" size="large" />
              </el-form-item>
              <el-form-item label="作曲家" prop="composer" class="form-item flex-1">
                <el-input v-model="form.composer" placeholder="如：塔雷加" size="large" />
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="使用乐器 *" prop="instrument" class="form-item flex-1">
                <el-select v-model="form.instrument" placeholder="选择乐器" size="large" style="width: 100%">
                  <el-option label="钢琴" value="钢琴" />
                  <el-option label="古典吉他" value="古典吉他" />
                  <el-option label="民谣吉他" value="民谣吉他" />
                  <el-option label="电吉他" value="电吉他" />
                  <el-option label="小提琴" value="小提琴" />
                  <el-option label="大提琴" value="大提琴" />
                  <el-option label="架子鼓" value="架子鼓" />
                  <el-option label="电子琴" value="电子琴" />
                  <el-option label="尤克里里" value="尤克里里" />
                  <el-option label="竹笛" value="竹笛" />
                  <el-option label="洞箫" value="洞箫" />
                  <el-option label="古筝" value="古筝" />
                  <el-option label="二胡" value="二胡" />
                  <el-option label="萨克斯" value="萨克斯" />
                  <el-option label="小号" value="小号" />
                  <el-option label="手风琴" value="手风琴" />
                  <el-option label="陶埙" value="陶埙" />
                  <el-option label="卡洪鼓" value="卡洪鼓" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
              <el-form-item label="难度等级 *" prop="difficulty" class="form-item flex-1">
                <el-radio-group v-model="form.difficulty" size="large">
                  <el-radio-button label="初级" />
                  <el-radio-button label="中级" />
                  <el-radio-button label="高级" />
                </el-radio-group>
              </el-form-item>
              <el-form-item label="音乐风格 *" prop="style" class="form-item flex-1">
                <el-select v-model="form.style" placeholder="选择风格" size="large" style="width: 100%">
                  <el-option label="古典" value="古典" />
                  <el-option label="流行" value="流行" />
                  <el-option label="爵士" value="爵士" />
                  <el-option label="摇滚" value="摇滚" />
                  <el-option label="民谣" value="民谣" />
                  <el-option label="民乐" value="民乐" />
                  <el-option label="浪漫" value="浪漫" />
                  <el-option label="巴洛克" value="巴洛克" />
                  <el-option label="蓝调" value="蓝调" />
                  <el-option label="电子" value="电子" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">练习详情</h3>
            <div class="form-row">
              <el-form-item label="练习进度" prop="progress" class="form-item flex-1">
                <el-slider v-model="form.progress" :min="0" :max="100" :step="5" show-input />
              </el-form-item>
            </div>
            <el-form-item label="练习痛点 *" prop="painPoints">
              <el-input
                v-model="form.painPoints"
                type="textarea"
                :rows="3"
                placeholder="描述一下你在练习中遇到的困难，比如：大横按转换不流畅、轮指不够均匀、气息控制不好等"
              />
            </el-form-item>
            <el-form-item label="想找谁一起练 *" prop="lookingFor">
              <el-input
                v-model="form.lookingFor"
                type="textarea"
                :rows="3"
                placeholder="描述一下你想找什么样的搭子，比如：想找同样练古典吉他的朋友二重奏、想组个爵士小乐队需要贝斯手等"
              />
            </el-form-item>
          </div>

          <div class="form-actions">
            <el-button size="large" @click="goBack">取消</el-button>
            <el-button type="primary" size="large" :loading="submitting" @click="submit">
              <el-icon><Check /></el-icon>
              发布曲目
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { pieceApi } from '../api'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const requireLogin = inject('requireLogin', () => router.push('/login'))

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  title: '',
  composer: '',
  instrument: '',
  difficulty: '初级',
  style: '',
  progress: 0,
  painPoints: '',
  lookingFor: ''
})

const rules = {
  title: [{ required: true, message: '请输入曲目名称', trigger: 'blur' }],
  instrument: [{ required: true, message: '请选择乐器', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  style: [{ required: true, message: '请选择风格', trigger: 'change' }],
  painPoints: [{ required: true, message: '请填写练习痛点', trigger: 'blur' }],
  lookingFor: [{ required: true, message: '请填写想找谁一起练', trigger: 'blur' }]
}

const goBack = () => {
  router.push('/pieces')
}

const submit = async () => {
  if (!userStore.isLoggedIn) {
    requireLogin()
    return
  }

  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  submitting.value = true
  try {
    const result = await pieceApi.create(form)
    ElMessage.success('发布成功！')
    router.push(`/pieces/${result.piece.id}`)
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '发布失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  margin: 0 0 10px;
}

.page-header p {
  margin: 0;
  opacity: 0.9;
}

.form-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: var(--text-primary);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.form-item {
  flex: 1;
}

.form-item.flex-1 {
  flex: 1;
}

.form-item.flex-2 {
  flex: 2;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-card {
    padding: 24px;
  }
}
</style>
