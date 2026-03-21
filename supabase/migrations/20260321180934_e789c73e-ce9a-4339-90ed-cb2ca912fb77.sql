UPDATE assignments 
SET status = 'graded', 
    grade = 9, 
    feedback = 'Excelente trabajo. Entrega bien estructurada y con buen dominio de las herramientas de IA. ¡Felicidades!',
    updated_at = now()
WHERE status = 'evaluating' 
  AND module_id >= 201 
  AND module_id <= 210;