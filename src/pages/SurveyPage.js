import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const SurveyPage = ({ user }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchQuestions();
    checkResponseStatus();
  }, []);

  const fetchQuestions = async () => {
    try {
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const questionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Gagal memuat pertanyaan');
    } finally {
      setLoading(false);
    }
  };

  const checkResponseStatus = async () => {
    try {
      const responsesRef = collection(db, 'responses');
      const q = query(responsesRef, where('user_email', '==', user.email));
      const querySnapshot = await getDocs(q);

      // Check settings for multiple responses
      const settingsRef = collection(db, 'settings');
      const settingsSnapshot = await getDocs(settingsRef);
      const settings = settingsSnapshot.docs[0]?.data() || { allow_multiple_responses: false };

      const hasResponded = querySnapshot.size > 0;
      const canSubmit = !hasResponded || settings.allow_multiple_responses;

      setCanSubmit(canSubmit);
      if (!canSubmit) {
        toast.info('Anda sudah mengisi survey ini sebelumnya');
      }
    } catch (error) {
      console.error('Error checking response status:', error);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId, option, checked) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter(item => item !== option) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all questions are answered
    const unanswered = questions.filter(q => !answers[q.id] ||
      (Array.isArray(answers[q.id]) && answers[q.id].length === 0));

    if (unanswered.length > 0) {
      toast.error('Mohon jawab semua pertanyaan');
      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = questions.map(q => ({
        question_id: q.id,
        answer: answers[q.id]
      }));

      await addDoc(collection(db, 'responses'), {
        user_email: user.email,
        user_name: user.displayName,
        answers: formattedAnswers,
        timestamp: Timestamp.now()
      });

      setSubmitted(true);
      toast.success('Terima kasih! Jawaban Anda telah tersimpan.');
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Gagal mengirim jawaban');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Terima Kasih!</h2>
          <p className="text-slate-600 mb-6">
            Jawaban Anda telah berhasil tersimpan. Kontribusi Anda sangat berharga untuk penelitian kami.
          </p>
          <Button 
            data-testid="back-to-home-btn"
            onClick={() => navigate('/')} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Kembali ke Beranda
          </Button>
        </Card>
      </div>
    );
  }

  if (!canSubmit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Sudah Mengisi Survey</h2>
          <p className="text-slate-600 mb-6">
            Anda sudah mengisi survey ini sebelumnya. Terima kasih atas partisipasinya!
          </p>
          <Button 
            data-testid="back-home-btn"
            onClick={() => navigate('/')} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Kembali ke Beranda
          </Button>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-slate-600 mb-4">Belum ada pertanyaan survey yang tersedia.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            data-testid="back-button"
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Survey Penelitian
            </h1>
            <p className="text-slate-600">
              Dampak Game Online Terhadap Remaja SMA di DI.Yogyakarta
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Diisi oleh: <span className="font-medium text-slate-700">{user.displayName}</span>
            </p>
          </Card>
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id} data-testid={`question-card-${index}`} className="p-6 bg-white/90 backdrop-blur-sm border-2 hover:border-blue-200 transition-all">
              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">{question.text}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {question.type === 'short_text' && 'Jawaban singkat'}
                      {question.type === 'long_text' && 'Jawaban panjang'}
                      {question.type === 'multiple_choice' && 'Pilih satu'}
                      {question.type === 'checkbox' && 'Pilih semua yang sesuai'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Short Text */}
              {question.type === 'short_text' && (
                <Input
                  data-testid={`answer-input-${index}`}
                  placeholder="Ketik jawaban Anda..."
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="bg-white border-slate-300"
                  required
                />
              )}

              {/* Long Text */}
              {question.type === 'long_text' && (
                <Textarea
                  data-testid={`answer-textarea-${index}`}
                  placeholder="Ketik jawaban Anda..."
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="bg-white border-slate-300 min-h-[120px]"
                  required
                />
              )}

              {/* Multiple Choice */}
              {question.type === 'multiple_choice' && question.options && (
                <RadioGroup
                  value={answers[question.id]}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  required
                >
                  <div className="space-y-3">
                    {question.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <RadioGroupItem 
                          data-testid={`radio-option-${index}-${optIdx}`}
                          value={option} 
                          id={`${question.id}-${optIdx}`} 
                        />
                        <Label 
                          htmlFor={`${question.id}-${optIdx}`} 
                          className="cursor-pointer flex-1"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {/* Checkbox */}
              {question.type === 'checkbox' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, optIdx) => (
                    <div key={optIdx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <Checkbox
                        data-testid={`checkbox-option-${index}-${optIdx}`}
                        id={`${question.id}-${optIdx}`}
                        checked={(answers[question.id] || []).includes(option)}
                        onCheckedChange={(checked) => handleCheckboxChange(question.id, option, checked)}
                      />
                      <Label 
                        htmlFor={`${question.id}-${optIdx}`} 
                        className="cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {/* Submit Button */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-2">
            <Button 
              data-testid="submit-survey-btn"
              type="submit" 
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Kirim Jawaban
                </>
              )}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default SurveyPage;
