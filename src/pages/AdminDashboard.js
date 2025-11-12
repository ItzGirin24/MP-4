  import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  Plus,
  Trash2,
  Edit,
  Users,
  FileText,
  BarChart3,
  LogOut,
  ArrowLeft,
  GraduationCap,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';



const AdminDashboard = ({ setIsAdmin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Question form state
  const [questionForm, setQuestionForm] = useState({
    text: '',
    type: 'short_text',
    options: [''],
    order: 0
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'responses') {
        // Fetch responses and calculate stats
        const responsesRef = collection(db, 'responses');
        const responsesSnapshot = await getDocs(responsesRef);
        const responsesData = responsesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        setResponses(responsesData);

        // Calculate stats
        const uniqueEmails = new Set(responsesData.map(r => r.user_email));
        const questionsRef = collection(db, 'questions');
        const questionsSnapshot = await getDocs(questionsRef);

        // Calculate question stats
        const questionStats = questionsSnapshot.docs.map(qDoc => {
          const question = { id: qDoc.id, ...qDoc.data() };
          const answers = responsesData.flatMap(r =>
            r.answers.filter(a => a.question_id === qDoc.id)
          );

          const frequency = {};
          answers.forEach(answer => {
            const value = Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer;
            frequency[value] = (frequency[value] || 0) + 1;
          });

          return {
            question_id: qDoc.id,
            question_text: question.text,
            total_answers: answers.length,
            frequency: Object.keys(frequency).length > 0 ? frequency : null
          };
        });

        setStats({
          total_responses: responsesData.length,
          unique_respondents: uniqueEmails.size,
          total_questions: questionsSnapshot.size,
          question_stats: questionStats
        });
      }

      if (activeTab === 'questions') {
        const questionsRef = collection(db, 'questions');
        const q = query(questionsRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const questionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuestions(questionsData);
      }

      if (activeTab === 'settings') {
        const settingsRef = collection(db, 'settings');
        const settingsSnapshot = await getDocs(settingsRef);
        const settingsData = settingsSnapshot.docs[0]?.data() || {
          allow_multiple_responses: false,
          admin_password: 'admin123'
        };
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    toast.success('Logout berhasil');
    navigate('/');
  };

  const handleAddOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index, value) => {
    setQuestionForm(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      text: '',
      type: 'short_text',
      options: [''],
      order: Math.max(1, questions.length + 1)
    });
    setEditingQuestion(null);
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();

    const payload = {
      text: questionForm.text,
      type: questionForm.type,
      order: questionForm.order
    };

    if (questionForm.type === 'multiple_choice' || questionForm.type === 'checkbox') {
      const filteredOptions = questionForm.options.filter(opt => opt.trim() !== '');
      if (filteredOptions.length < 2) {
        toast.error('Tambahkan minimal 2 pilihan');
        return;
      }
      payload.options = filteredOptions;
    }

    try {
      if (editingQuestion) {
        await updateDoc(doc(db, 'questions', editingQuestion.id), payload);
        toast.success('Pertanyaan berhasil diupdate');
      } else {
        await addDoc(collection(db, 'questions'), payload);
        toast.success('Pertanyaan berhasil ditambahkan');
      }

      setShowQuestionDialog(false);
      resetQuestionForm();
      fetchData();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Gagal menyimpan pertanyaan');
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text,
      type: question.type,
      options: question.options || [''],
      order: question.order
    });
    setShowQuestionDialog(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Yakin ingin menghapus pertanyaan ini?')) return;

    try {
      await deleteDoc(doc(db, 'questions', questionId));
      toast.success('Pertanyaan berhasil dihapus');
      fetchData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Gagal menghapus pertanyaan');
    }
  };

  const handleUpdateSettings = async (field, value) => {
    try {
      const settingsRef = collection(db, 'settings');
      const settingsSnapshot = await getDocs(settingsRef);
      const settingsDoc = settingsSnapshot.docs[0];

      if (settingsDoc) {
        await updateDoc(doc(db, 'settings', settingsDoc.id), {
          [field]: value
        });
      } else {
        await addDoc(collection(db, 'settings'), {
          allow_multiple_responses: false,
          admin_password: 'admin123',
          [field]: value
        });
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));

      toast.success('Pengaturan berhasil diupdate');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Gagal mengupdate pengaturan');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-academic-muted via-white to-academic-muted/50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-academic-border sticky top-0 z-50 academic-transition">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="bg-gradient-to-br from-academic-primary to-academic-secondary p-2 sm:p-3 rounded-xl academic-transition hover:scale-105 flex-shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-academic-foreground academic-heading truncate">Admin Dashboard</h1>
                <p className="text-xs text-slate-600 academic-body hidden sm:block">SMAIT Abu Bakar Boarding School</p>
                <p className="text-xs text-slate-600 academic-body sm:hidden truncate">SMAIT Abu Bakar</p>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                data-testid="admin-logout-btn"
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setIsMobileMenuOpen(false); }} className="space-y-4 sm:space-y-6">
          {/* Desktop Tabs */}
          <TabsList className="hidden sm:grid grid-cols-4 w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border border-academic-border academic-transition">
            <TabsTrigger data-testid="tab-overview" value="overview" className="flex items-center gap-2 academic-transition hover:bg-academic-primary/10 data-[state=active]:bg-academic-primary data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger data-testid="tab-questions" value="questions" className="flex items-center gap-2 academic-transition hover:bg-academic-primary/10 data-[state=active]:bg-academic-primary data-[state=active]:text-white">
              <ClipboardList className="w-4 h-4" />
              <span>Pertanyaan</span>
            </TabsTrigger>
            <TabsTrigger data-testid="tab-responses" value="responses" className="flex items-center gap-2 academic-transition hover:bg-academic-primary/10 data-[state=active]:bg-academic-primary data-[state=active]:text-white">
              <FileText className="w-4 h-4" />
              <span>Respon</span>
            </TabsTrigger>
            <TabsTrigger data-testid="tab-settings" value="settings" className="flex items-center gap-2 academic-transition hover:bg-academic-primary/10 data-[state=active]:bg-academic-primary data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </TabsTrigger>
          </TabsList>

          {/* Mobile Menu */}
          <div className="sm:hidden">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="outline"
              className="w-full bg-white/80 backdrop-blur-sm border border-academic-border academic-transition hover:bg-academic-primary/5"
            >
              <Menu className="w-4 h-4 mr-2" />
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'questions' && 'Pertanyaan'}
              {activeTab === 'responses' && 'Respon'}
              {activeTab === 'settings' && 'Pengaturan'}
            </Button>

            {isMobileMenuOpen && (
              <div className="mt-2 bg-white/95 backdrop-blur-sm border border-academic-border rounded-lg academic-transition shadow-lg">
                <div className="flex flex-col">
                  <button
                    onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 text-left hover:bg-academic-primary/10 academic-transition ${
                      activeTab === 'overview' ? 'bg-academic-primary text-white' : 'text-academic-foreground'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('questions'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 text-left hover:bg-academic-primary/10 academic-transition ${
                      activeTab === 'questions' ? 'bg-academic-primary text-white' : 'text-academic-foreground'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Pertanyaan</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('responses'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 text-left hover:bg-academic-primary/10 academic-transition ${
                      activeTab === 'responses' ? 'bg-academic-primary text-white' : 'text-academic-foreground'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Respon</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 text-left hover:bg-academic-primary/10 academic-transition rounded-b-lg ${
                      activeTab === 'settings' ? 'bg-academic-primary text-white' : 'text-academic-foreground'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Pengaturan</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Card className="p-6 border-2 hover:border-academic-primary/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1 academic-body">Total Respon</p>
                        <p className="text-3xl font-bold text-academic-foreground academic-heading">{stats.total_responses}</p>
                      </div>
                      <div className="bg-academic-primary/10 p-3 rounded-xl academic-transition">
                        <FileText className="w-6 h-6 text-academic-primary" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-2 hover:border-academic-secondary/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1 academic-body">Responden Unik</p>
                        <p className="text-3xl font-bold text-academic-foreground academic-heading">{stats.unique_respondents}</p>
                      </div>
                      <div className="bg-academic-secondary/10 p-3 rounded-xl academic-transition">
                        <Users className="w-6 h-6 text-academic-secondary" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-2 hover:border-academic-accent/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1 academic-body">Total Pertanyaan</p>
                        <p className="text-3xl font-bold text-academic-foreground academic-heading">{stats.total_questions}</p>
                      </div>
                      <div className="bg-academic-accent/10 p-3 rounded-xl academic-transition">
                        <ClipboardList className="w-6 h-6 text-academic-accent" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Question Statistics */}
                <Card className="p-6 border-2 hover:border-academic-primary/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-academic-foreground mb-4 academic-subheading">Statistik Pertanyaan</h3>
                  <div className="space-y-6">
                    {stats.question_stats.map((qStat, index) => (
                      <div key={qStat.question_id} className="border-b border-slate-200 pb-4 last:border-0">
                        <p className="font-semibold text-academic-foreground mb-2 academic-body">
                          {index + 1}. {qStat.question_text}
                        </p>
                        <p className="text-sm text-slate-600 mb-2 academic-body">
                          Total jawaban: {qStat.total_answers}
                        </p>
                        
                        {qStat.frequency && (
                          <div className="bg-academic-muted/30 p-4 rounded-xl academic-transition">
                            <p className="text-sm font-medium text-academic-foreground mb-2 academic-body">Distribusi Jawaban:</p>
                            <div className="space-y-2">
                              {Object.entries(qStat.frequency).map(([option, count]) => (
                                <div key={option} className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 academic-body">{option}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-32 bg-academic-muted rounded-full h-2 academic-transition">
                                      <div
                                        className="bg-academic-primary h-2 rounded-full academic-transition"
                                        style={{ width: `${(count / qStat.total_answers) * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium text-academic-foreground w-12 text-right academic-body">
                                      {count} ({Math.round((count / qStat.total_answers) * 100)}%)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-academic-foreground academic-heading">Kelola Pertanyaan</h2>
              <Dialog open={showQuestionDialog} onOpenChange={(open) => {
                setShowQuestionDialog(open);
                if (!open) resetQuestionForm();
              }}>
                <DialogTrigger asChild>
                  <Button
                    data-testid="add-question-btn"
                    className="bg-gradient-to-r from-academic-primary to-academic-secondary hover:from-academic-primary/90 hover:to-academic-secondary/90 academic-transition w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pertanyaan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto" aria-describedby="question-dialog-description">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
                    </DialogTitle>
                    <p id="question-dialog-description" className="text-sm text-slate-600">
                      {editingQuestion ? 'Edit pertanyaan yang sudah ada' : 'Tambahkan pertanyaan baru untuk survey'}
                    </p>
                  </DialogHeader>
                  <form onSubmit={handleCreateQuestion} className="space-y-4">
                    <div>
                      <Label htmlFor="question-text">Pertanyaan *</Label>
                      <Textarea
                        data-testid="question-text-input"
                        id="question-text"
                        value={questionForm.text}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Ketik pertanyaan..."
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="question-type">Tipe Pertanyaan *</Label>
                      <Select 
                        value={questionForm.type} 
                        onValueChange={(value) => setQuestionForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger data-testid="question-type-select" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short_text">Teks Singkat</SelectItem>
                          <SelectItem value="long_text">Teks Panjang</SelectItem>
                          <SelectItem value="multiple_choice">Pilihan Ganda</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(questionForm.type === 'multiple_choice' || questionForm.type === 'checkbox') && (
                      <div>
                        <Label>Pilihan Jawaban *</Label>
                        <div className="space-y-2 mt-2">
                          {questionForm.options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                data-testid={`option-input-${index}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Pilihan ${index + 1}`}
                              />
                              {questionForm.options.length > 1 && (
                                <Button
                                  data-testid={`remove-option-${index}`}
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleRemoveOption(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          data-testid="add-option-btn"
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddOption}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Pilihan
                        </Button>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="question-order">Urutan</Label>
                      <Input
                        data-testid="question-order-input"
                        id="question-order"
                        type="number"
                        value={questionForm.order || 1}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, order: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="mt-1"
                        min="1"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button
                        data-testid="save-question-btn"
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-academic-primary to-academic-secondary hover:from-academic-primary/90 hover:to-academic-secondary/90 academic-transition"
                      >
                        {editingQuestion ? 'Update' : 'Simpan'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowQuestionDialog(false)}
                        className="w-full sm:w-auto"
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {questions.length === 0 ? (
                <Card className="p-8 text-center border-2 hover:border-academic-primary/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm">
                  <p className="text-slate-600 academic-body">Belum ada pertanyaan. Tambahkan pertanyaan pertama Anda!</p>
                </Card>
              ) : (
                questions.map((question, index) => (
                  <Card key={question.id} data-testid={`question-item-${index}`} className="p-6 border-2 hover:border-academic-primary/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <span className="bg-gradient-to-br from-academic-primary to-academic-secondary text-white w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold academic-transition">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-academic-foreground mb-1 academic-body break-words">{question.text}</h3>
                            <p className="text-sm text-slate-600 academic-body">
                              Tipe: {question.type === 'short_text' && 'Teks Singkat'}
                              {question.type === 'long_text' && 'Teks Panjang'}
                              {question.type === 'multiple_choice' && 'Pilihan Ganda'}
                              {question.type === 'checkbox' && 'Checkbox'}
                            </p>
                            {question.options && (
                              <div className="mt-2">
                                <p className="text-sm text-slate-500 academic-body">Pilihan:</p>
                                <ul className="list-disc list-inside text-sm text-slate-600 academic-body break-words">
                                  {question.options.map((opt, i) => (
                                    <li key={i} className="break-words">{opt}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          data-testid={`edit-question-${index}`}
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditQuestion(question)}
                          className="hover:bg-academic-primary/10 academic-transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          data-testid={`delete-question-${index}`}
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="hover:bg-red-50 academic-transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-academic-foreground academic-heading">Semua Respon</h2>
              <p className="text-sm sm:text-base text-slate-600 academic-body">{responses.length} respon</p>
            </div>

            <div className="space-y-4">
              {responses.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-slate-600">Belum ada respon.</p>
                </Card>
              ) : (
                responses.map((response, index) => (
                  <Card key={response.id} data-testid={`response-item-${index}`} className="p-4 sm:p-6 border-2 hover:border-academic-primary/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm">
                    <div className="mb-4 pb-4 border-b border-slate-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-academic-foreground academic-body break-words">{response.user_name}</p>
                          <p className="text-sm text-slate-600 academic-body break-all">{response.user_email}</p>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 academic-body flex-shrink-0">
                          {new Date(response.timestamp).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {response.answers.map((answer, ansIdx) => {
                        const question = questions.find(q => q.id === answer.question_id);
                        return (
                          <div key={ansIdx}>
                            <p className="text-sm font-medium text-slate-700">
                              {question?.text || 'Pertanyaan tidak ditemukan'}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              {Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Pengaturan</h2>

            {settings && (
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">
                        Izinkan Multiple Response
                      </h3>
                      <p className="text-sm text-slate-600">
                        Jika diaktifkan, user bisa mengisi survey lebih dari sekali
                      </p>
                    </div>
                    <Switch
                      data-testid="allow-multiple-switch"
                      checked={settings.allow_multiple_responses}
                      onCheckedChange={(checked) => handleUpdateSettings('allow_multiple_responses', checked)}
                    />
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Ganti Password Admin</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const newPassword = e.target.newPassword.value;
                    handleUpdateSettings('admin_password', newPassword);
                    e.target.reset();
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">Password Baru</Label>
                      <Input
                        data-testid="new-password-input"
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Masukkan password baru"
                        required
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      data-testid="update-password-btn"
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Update Password
                    </Button>
                  </form>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;